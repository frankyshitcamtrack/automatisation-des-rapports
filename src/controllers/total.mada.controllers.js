const path = require('path');
const cron = require('node-cron');
const moment = require('moment');
const mom = require('moment-timezone');
const { getTotalRepportData } = require('../models/total.model');
const { getTotalAfiliate, getTotalTransporter, getTotalTrucks, getPIO, getPIOMADA, getTotalNigths, allExceptionType, summaryException, summaryTrip, getTotalDrivers, getpreventreposhebdo, getpreventTestreposhebdo, getLastDriving, getLastDayTransporter } = require('../services/total.service')
const { getFistAndLastHourDay, getFistAndLastHourDay18H05H, getFirstAndLastSevendays } = require('../utils/getFirstAndLastHourDay');
const {
    getFirstAndLastDayMonth,
} = require('../utils/getFistDayAndLastDayMonth');
const { convertDateToTimeStamp, dateInYyyyMmDdHhMmSs } = require('../utils/dateFormat')
const { compensateDrivers } = require('../utils/fillsDriverFromArray');
const { mergeSimpleParkingData } = require('../utils/mergeTotalDataParking');
const { convertJsonToExcelTotal } = require('../utils/genrateXlsx');
const { processNightDrivingSimple } = require('../utils/processNigthDriving');
const { keepLatestNotifications } = require('../utils/removeDuplicateItemInArr');
const { analyzeDrivers } = require('../utils/summaryRanking');
const { generateFleetReport } = require('../utils/generateFleetReport')
const { Receivers, totalReceivers } = require('../storage/mailReceivers.storage');
const { Senders, totalSenders } = require('../storage/mailSender.storage');
const { sendMail } = require('../utils/sendMail');
const { deleteFile } = require('../utils/deleteFile');
const { legendeRankingTotal } = require('../utils/genrateXlsx');
const { ALL_VEHICLE, ALL_VEHICLE_MADA, LX_45, MADA_RANKING_REPORT, MADA_REPOS_HEBDOMADAIRE, MADA_CLOTURE_ACTIVITE, MDVR, MDVR_MADA } = require('../constants/clients');
const { TOTAL_ENERGIES, OBC_TEMCM, OBC_TEMMA, TOTAL_ENERGIES_MADA } = require('../constants/ressourcesClient');
const {
    STATUS_VEHICLE,
    STATUS_VEHICLE_NEW,
    RAPPORT_CLOTURE_MADA,
    RAPPORT_RANKING_MADA,
    RAPPORT_REPOS_MADA } = require('../constants/template');
const { STATUS, TRIP_END, TRIP } = require('../constants/subGroups');
const { TOTAL_CLOTURE_SUBJECT_MAIL, TOTAL_RANKING_SUBJECT_MAIL, TOTAL_NIGTH_DRIVING_SUBJECT_MAIL, TOTAL_REPOS_HEBDO_SUBJECT_MAIL } = require('../constants/mailSubjects');
const { devconfig } = require('../config/wialong.config')
const test = [{ name: 'frank', address: 'franky.shity@camtrack.net' }];

const ymaneTokenMada = devconfig.ymaneTokenMada

//const pass = process.env.PASS_MAIL;
const pass = process.env.PASS_NOTIFICATION;


/* function getStartDateForNight(now) {
    // Convertir l'heure actuelle en heure de Madagascar (UTC+3)
    const madagascarTime = now.clone().utcOffset(3);

    // Si on est entre 00:00 et 03:00 à Madagascar, la nuit a commencé la veille à 21h
    if (madagascarTime.hour() < 3) {
        return madagascarTime.clone().subtract(1, 'day').startOf('day'); // 00:00 du jour précédent
    }
    // Sinon, on est entre 21h-23h, donc startDate = 00:00 du jour même
    return madagascarTime.clone().startOf('day');
} */



function getStartDateForNight(now) {
    // Si on est entre 00:00 et 03:00, la nuit a commencé la veille à 21h
    if (now.hour() < 3) {
        return now.clone().subtract(1, 'day').startOf('day'); // 00:00 du jour précédent
    }
    // Sinon, on est entre 21h-23h, donc startDate = 00:00 du jour même
    return now.clone().startOf('day');
}

function getMadagascarTimeRange(localDate, startHour = 0, endHour = 21) {
    const madagascarStart = localDate.clone().tz('Indian/Antananarivo').hour(startHour).minute(0).second(0);
    const madagascarEnd = localDate.clone().tz('Indian/Antananarivo').hour(endHour).minute(0).second(0);

    console.log(madagascarStart.format('YYYY-MM-DD HH:mm:ss'));
    console.log(madagascarEnd.format('YYYY-MM-DD HH:mm:ss'));

    return {
        start: madagascarStart,
        end: madagascarEnd,
        startFormatted: madagascarStart.format('YYYY-MM-DD HH:mm:ss'),
        endFormatted: madagascarEnd.format('YYYY-MM-DD HH:mm:ss')
    };
}

const formatDateForFilename = (dateString) => {
    return dateString?.replace(/:/g, '-').replace(/ /g, '_');
};


function isEmptyValue(value) {
    if (value == null || value === undefined) return true;

    if (typeof value !== 'string') return false;

    const trimmed = value.trim();
    return trimmed === '' ||
        trimmed === '--' ||
        trimmed === '-----' ||
        trimmed === '------' ||
        /^-+$/.test(trimmed) ||
        /^n\/a$/i.test(trimmed) ||
        trimmed === 'NA' ||
        trimmed === 'null' ||
        trimmed === 'undefined';
}


//nighht driving
/* async function generateNigthDrivingReport() {
    const sender = await totalSenders(CAMEROUN_NIGHT_DRIVING_REPORT, 'B');
    const receivers = await totalReceivers(CAMEROUN_NIGHT_DRIVING_REPORT, 'C');

    const totalTrucks = await getTotalTrucks(ymaneTokenMada);
    const totalTransporter = await getTotalTransporter(ymaneTokenMada);
    const totalAfiliate = await getTotalAfiliate(ymaneTokenMada);

    const firstHourLastNigth = getFistAndLastHourDay18H05H();
    const drivers = await getTotalDrivers(ymaneTokenMada)


    const fisrtHourNigth = firstHourLastNigth.firstHourDayFormat;
    const lastHourNigth = firstHourLastNigth.lasthourDayFormat;
    const titleDate = firstHourLastNigth.dateTitle
    const pathFile = 'rapport/Total/Nigth';

    const column = [{ key: "filiale" }, { key: "transporteur" }, { key: "Vehicule" }, { key: "Driver" }, { key: "start point" }, { key: "end point" }, { key: "start date and time" }, { key: "end date and time" }, { key: "Total duration" }, { key: "Exception" }, { key: "Niveau" }, { key: "Observation" }];

    const totalNigthsDriving = await getTotalNigths(fisrtHourNigth, lastHourNigth, ymaneTokenMada);


    if (totalTrucks, totalTransporter, totalAfiliate) {
        const nigtDrivingData = processNightDrivingSimple(totalNigthsDriving["resultat"], drivers['resultat'], totalTrucks['resultat'], totalTransporter['resultat'], totalAfiliate['resultat'])

        await convertJsonToExcelTotal(
            nigtDrivingData,
            'Conduite de Nuit',
            `${pathFile}-${titleDate}.xlsx`,
            column
        ).then(() => {
            if (sender && receivers) {
                setTimeout(() => {
                    sendMail(
                        sender,
                        receivers,
                        pass,
                        `${RAPPORT_NIGHT_DRIVING}_${titleDate}`,
                        `${TOTAL_NIGTH_DRIVING_SUBJECT_MAIL}`,
                        `${RAPPORT_NIGHT_DRIVING}_${titleDate}.xlsx`,
                        path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
                    );
                    deleteFile(
                        path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
                    );
                }, 30000);
            }
        })
    }
}
 */

//cloture
async function generateTotalClotureRepport(firstDate, lastDate) {
    const sender = await totalSenders(MADA_CLOTURE_ACTIVITE, 'B');
    const receivers = await totalReceivers(MADA_CLOTURE_ACTIVITE, 'C');


    // const fistAndLastHourDay = getFistAndLastHourDay();

    const firstHourDay = convertDateToTimeStamp(firstDate);
    const lastHourDay = convertDateToTimeStamp(lastDate);

    const totalTrucks = await getTotalTrucks(ymaneTokenMada);

    const totalTransporter = await getTotalTransporter(ymaneTokenMada);
    const totalAfiliate = await getTotalAfiliate(ymaneTokenMada);

    const PIO = await getPIOMADA();

    //console.log(PIO);

    const safeFirst = formatDateForFilename(firstDate);
    const safeLast = formatDateForFilename(lastDate);


    const titleDate = `${safeLast}`
    const pathFile = 'rapport/Total/Cloture';


    await getTotalRepportData(
        TOTAL_ENERGIES_MADA,
        STATUS_VEHICLE,
        MDVR_MADA,
        firstHourDay,
        lastHourDay,
        TRIP
    )
        .then(async (res) => {
            const objLenth = res?.obj.length;

            //console.log(res?.obj);
            //const filterVhleY = res?.obj.filter(item => item.Grouping === 'LTTR 821 AT')

            //console.log(filterVhleY);

            /* 
                        const tripEnd = await getTotalRepportData(
                            TOTAL_ENERGIES,
                            STATUS_VEHICLE,
                            ALL_VEHICLE,
                            firstHourDay,
                            lastHourDay,
                            TRIP_END
                        ) */

            const OBCstatus = await getTotalRepportData(
                OBC_TEMMA,
                STATUS_VEHICLE_NEW,
                ALL_VEHICLE_MADA,
                firstHourDay,
                lastHourDay,
                TRIP
            )



            if (objLenth > 0 && OBCstatus) {
                //const filter = OBCstatus.obj?.filter(item => item.Grouping === "7223 AH")
                //console.log(filter);

                //const compensateDriver2 = compensateDrivers(compensateDriver, tripEnd.obj)
                const fullArr = [...res.obj, ...OBCstatus.obj]



                const column = [{ key: "Filiale" }, { key: "Transporteur" }, { key: 'Grouping' }, { key: 'Status Ignition' }, { key: 'Heure de Cloture' }, { key: 'Emplacement' }, { key: 'Coordonnées' }, { key: "Statut POI" }];
                const fleetColumn = [{ key: "Transporteur" }, { key: "Nombre De Camions" }, { key: "Etat flotte" }, { key: "Heure De cloture" }, { key: "Nombres de Véhicules Actifs" }, { key: "Camions Hors POI" }, { key: "Derniere mise a jour" }];

                if (totalTrucks, totalTransporter, totalAfiliate, PIO) {
                    const finalData = mergeSimpleParkingData(fullArr, totalTrucks["resultat"], totalTransporter["resultat"], totalAfiliate["resultat"]);

                    const filterData = finalData.map(item => {
                        return { ...item, "Statut PIO": PIO.includes(item?.Emplacement?.text) ? "Dans POI" : "Hors POI" }
                    });

                    //const filterVhleL = filterData.filter(item => item.Grouping === 'LTTR 821 AT')

                    //console.log(filterVhleL);

                    const removeDup = keepLatestNotifications(filterData);

                    //const filterVhle = removeDup.filter(item => item.Grouping === 'LTTR 821 AT')

                    //console.log(filterVhle);

                    //console.log(removeDup[1]);
                    const listVehicleData = removeDup.map(item => {


                        const clean = (value) => isEmptyValue(value) ? null : value;



                        const rawIgnition = item.Ignition;
                        const rawVitesse = item.Vitesse;
                        const rawEmplacement = item.Emplacement;
                        const rawCoordonnees = item.Emplacement ? {
                            text: item?.Emplacement?.hyperlink?.split('/')[5],
                            hyperlink: `https://www.google.com/maps/place/${item?.Emplacement?.hyperlink?.split('/')[5]}`
                        } : undefined;
                        const rawDateTime = item['Date et heure'];

                        //console.log(parseFloat(rawIgnition));

                        const cleanedItem = {
                            Filiale: item.Filiale && !isEmptyValue(item.Filiale) ? item.Filiale : '--',
                            Transporteur: item.Transporteur && !isEmptyValue(item.Transporteur) ? item.Transporteur : '--',
                            Grouping: item.Grouping && !isEmptyValue(item.Grouping) ? item.Grouping : '--',
                            'Status Ignition': (parseFloat(rawIgnition) === 0 || !parseFloat(rawIgnition)) ? "OFF" : 'ON',
                            //Vitesse: clean(rawVitesse) ? rawVitesse : '--',
                            //'Dernier Conducteur': item.Conducteur && !isEmptyValue(item.Conducteur) ? item.Conducteur : '--',
                            'Heure de Cloture': parseFloat(rawIgnition) > 0
                                ? '--'
                                : isEmptyValue(rawDateTime)
                                    ? '--'
                                    : rawDateTime,
                            Emplacement: clean(rawEmplacement) ? rawEmplacement : '--',
                            Coordonnées: clean(rawCoordonnees) ? rawCoordonnees : '--',
                            'Statut POI': item['Statut PIO'] && !isEmptyValue(item['Statut PIO']) ? item['Statut PIO'] : '--'
                        };


                        const keyFields = [
                            cleanedItem.Emplacement,
                            cleanedItem['Coordonnées'],
                            cleanedItem['Heure de Cloture'],
                        ];




                        const allKeyFieldsEmpty = keyFields.every(val => val === '--');


                        if (allKeyFieldsEmpty && cleanedItem['Status Ignition'] === 'OFF') {
                            cleanedItem['Status Ignition'] = 'OFF';
                            cleanedItem['Heure de Cloture'] = 'Not Applicable';
                        }

                        return cleanedItem;
                    });

                    const t = listVehicleData.filter(item => item.Transporteur === 'SOCOTRAP')
                    //console.log(t);

                    const fleetReport = generateFleetReport(listVehicleData);


                    if (fleetReport) {
                        await convertJsonToExcelTotal(
                            fleetReport,
                            'Feuille Etat Flotte',
                            `${pathFile}-${titleDate}.xlsx`,
                            fleetColumn
                        ).then(

                            setTimeout(async () => {
                                await convertJsonToExcelTotal(
                                    listVehicleData,
                                    'Feuille Liste des camions',
                                    `${pathFile}-${titleDate}.xlsx`,
                                    column
                                )
                            }, 5000)

                        );
                    }

                }

            } else {
                console.log(
                    `no data found in ${TOTAL_ENERGIES} ${STATUS}`
                );
            }
        })
        .then(() => {
            if (sender && receivers) {
                setTimeout(() => {
                    sendMail(
                        sender,
                        receivers,
                        pass,
                        `${RAPPORT_CLOTURE_MADA}_${titleDate}`,
                        `${TOTAL_CLOTURE_SUBJECT_MAIL}`,
                        `${RAPPORT_CLOTURE_MADA}_${titleDate}.xlsx`,
                        path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
                    );
                    deleteFile(
                        path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
                    );
                }, 30000);
            }
        })
        .catch((err) => console.log(err));
}


//ranking
async function generateTotalRankingRepport() {
    const sender = await totalSenders(MADA_RANKING_REPORT, 'B');
    const receivers = await totalReceivers(MADA_RANKING_REPORT, 'C');

    const fistAndLastHourDay = getFirstAndLastDayMonth();

    const firstHourDay = fistAndLastHourDay.fistDayFormat;
    const lastHourDay = fistAndLastHourDay.lastDayFormat;


    const getSummaryTrip = await summaryTrip(firstHourDay, lastHourDay, ymaneTokenMada);
    const getSummaryExceptions = await summaryException(firstHourDay, lastHourDay, ymaneTokenMada);
    const exceptionType = await allExceptionType();
    const drivers = await getTotalDrivers(ymaneTokenMada);
    const transporter = await getTotalTransporter(ymaneTokenMada)


    const titleDate = fistAndLastHourDay.dateTitle;
    const splitTitle = titleDate.split('-')
    const pathFile = 'rapport/Total/RankingMADA';
    const column = [{ key: "Driver" }, { key: 'Transporteur' }, { key: "Nombres d'Alertes Conduite de nuit" }, { key: "Nombres d'Alarme Conduite de nuit" }, { key: "Nombres d'Alertes conduite hebdomadaire" }, { key: "Nombres d'Alertes Repos hebdomadaire" }, { key: "Nombres d'Alarme Repos hebdomadaire" }, { key: "Nombres d'Alertes Travail hebdomadaire" }, { key: "Nombres d'Alarme Travail hebdomadaire" }, { key: "Nombres d'Alertes Travail journalier" }, { key: "Nombres d'Alarme Travail journalier" }, { key: "Nombres d'Alertes Conduite continue" }, { key: "Nombres d'Alarme Conduite continue" }, { key: "Nombres d'Alertes HB" }, { key: "Nombres d'Alarme HB" }, { key: "Nombres d'Alertes HA" }, { key: "Nombres d'Alarme HA" }, { key: "Nombres de Téléphone au volant" }, { key: "Nombres de smoking" }, { key: "Nombres de Ceinture de Sécurité" }, { key: "Nombres de fatigues" }, { key: "Nombres de distraction" }, { key: "Nombre totale de points perdu sur la période" }, { key: "Distance totale Parcouru sur la période (km)" }, { key: "Durée de Conduite sur la période" }, { key: "Durée de Conduite sur la période en heure" }, { key: "Ratio" }, { key: "Ranking" }];
    const rankinColumn = [{ key: "Ranking" }, { key: "Driver" }, { key: 'Transporteur' }, { key: 'Nombre de points perdus au 100km' }];
    const rankinColumnTransporterDetail = [{ key: "Transporteur" }, { key: "Nombres d'Alertes Conduite de nuit" }, { key: "Nombres d'Alarme Conduite de nuit" }, { key: "Nombres d'Alertes conduite hebdomadaire" }, { key: "Nombres d'Alertes Repos hebdomadaire" }, { key: "Nombres d'Alarme Repos hebdomadaire" }, { key: "Nombres d'Alertes Travail hebdomadaire" }, { key: "Nombres d'Alarme Travail hebdomadaire" }, { key: "Nombres d'Alertes Travail journalier" }, { key: "Nombres d'Alarme Travail journalier" }, { key: "Nombres d'Alertes Conduite continue" }, { key: "Nombres d'Alarme Conduite continue" }, { key: "Nombres d'Alertes HB" }, { key: "Nombres d'Alarme HB" }, { key: "Nombres d'Alertes HA" }, { key: "Nombres d'Alarme HA" }, { key: "Nombres de Téléphone au volant" }, { key: "Nombres de smoking" }, { key: "Nombres de Ceinture de Sécurité" }, { key: "Nombres de fatigues" }, { key: "Nombres de distraction" }, { key: "Nombre totale de points perdu sur la période" }, { key: "Distance totale Parcouru sur la période (km)" }, { key: "Durée de Conduite sur la période" }, { key: "Durée de Conduite sur la période en heure" }, { key: "Ratio" }, { key: "Ranking" }];
    const columnRankingTransporter = [{ key: "Ranking" }, { key: "Transporteur" }, { key: 'Nombre de points perdus au 100km' }];



    if (drivers, getSummaryExceptions, exceptionType, getSummaryTrip) {
        const ranking = analyzeDrivers(drivers["resultat"], exceptionType, getSummaryExceptions['resultat'], getSummaryTrip['resultat'], transporter['resultat']);

        if (ranking) {
            // Générer d'abord le fichier de légende
            await legendeRankingTotal(`${pathFile}-${titleDate}.xlsx`, 'Critères de Ranking');
            await new Promise(resolve => setTimeout(resolve, 5000));


            await convertJsonToExcelTotal(
                ranking?.rankingOnlyByCarrier,
                'Ranking Transporteur',
                `${pathFile}-${titleDate}.xlsx`,
                columnRankingTransporter
            );
            await new Promise(resolve => setTimeout(resolve, 10000));


            await convertJsonToExcelTotal(
                ranking?.rankingOnlyMADA,
                'Ranking Chauffeurs',
                `${pathFile}-${titleDate}.xlsx`,
                rankinColumn
            )
            await new Promise(resolve => setTimeout(resolve, 15000));

            await convertJsonToExcelTotal(
                ranking?.detailedResultsByCarrier,
                'Detail Ranking Transporteur',
                `${pathFile}-${titleDate}.xlsx`,
                rankinColumnTransporterDetail
            );
            await new Promise(resolve => setTimeout(resolve, 20000));

            await convertJsonToExcelTotal(
                ranking?.detailedResultsMADA,
                'Detail Ranking Chauffeurs',
                `${pathFile}-${titleDate}.xlsx`,
                column
            ).then(() => {
                if (sender && receivers) {
                    setTimeout(() => {
                        sendMail(
                            sender,
                            receivers,
                            pass,
                            `${RAPPORT_RANKING_MADA}_${splitTitle[1]}_${splitTitle[0]}`,
                            `${TOTAL_RANKING_SUBJECT_MAIL}`,
                            `${RAPPORT_RANKING_MADA}__${splitTitle[1]}_${splitTitle[0]}.xlsx`,
                            path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
                        );
                        deleteFile(
                            path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
                        );
                    }, 60000);
                }
            })
        }
    }
}

//repos hebdo
async function generateTotalReposHebdo() {
    const sender = await totalSenders(MADA_REPOS_HEBDOMADAIRE, 'B');
    const receivers = await totalReceivers(MADA_REPOS_HEBDOMADAIRE, 'C');


    const fistAndLastHourDay = getFistAndLastHourDay();

    const transporteurs = await getTotalTransporter(ymaneTokenMada);
    const vehicules = await getTotalTrucks(ymaneTokenMada);
    const lastDayDriving = await getLastDriving(ymaneTokenMada);
    const lastDayTransporter = await getLastDayTransporter(ymaneTokenMada)

    //console.log(lastDayDriving);

    const reposHebdoSummary5 = await getpreventreposhebdo(5, true, ymaneTokenMada);
    //const reposHebdoSummary5 = await getpreventTestreposhebdo(5, true);
    const reposHebdoSummary5Update = reposHebdoSummary5['resultat']?.map(item => {
        return {
            transporterid: item.transporterid,
            "Nombre de chauffeurs en 5 jours": item?.count
        }
    })

    const reposHebdoSummary6 = await getpreventreposhebdo(6, true, ymaneTokenMada);
    //const reposHebdoSummary6 = await getpreventTestreposhebdo(6, true);
    const reposHebdoSummary6Update = reposHebdoSummary6['resultat']?.map(item => {
        return {
            transporterid: item.transporterid,
            "Nombre de chauffeurs en 6 jours": item?.count
        }
    });

    // Créer un objet pour faciliter la recherche des noms de transporteurs
    const transporteursMap = {};
    transporteurs['resultat']?.forEach(transporteur => {
        transporteursMap[transporteur.trpid] = transporteur.nm;
    });

    const distancesTrMap = {};
    lastDayTransporter['resultat'].forEach(distance => {
        distancesTrMap[distance.transporterid] = {
            maxdates: distance.max,
        };
    });

    //console.log(distancesTrMap);

    // Fusionner les données
    const resultat = [];

    // Traiter les chauffeurs avec 5 jours
    reposHebdoSummary5Update.forEach(item => {
        const nomTransporteur = transporteursMap[item.transporterid];
        const distanceInfo = distancesTrMap[item.transporterid];
        const lastHour = new Date(distanceInfo?.maxdates);
        const maxdates = dateInYyyyMmDdHhMmSs(lastHour)

        //console.log(distanceInfo)

        if (nomTransporteur) {
            resultat.push({
                transporteur: nomTransporteur,
                'Nombre de chauffeurs en 5 jours': item['Nombre de chauffeurs en 5 jours'],
                'Nombre de chauffeurs en 6 jours': 0,
                "Derniere mise a jour": maxdates,

            });
        }
    });

    // Traiter les chauffeurs avec 6 jours
    reposHebdoSummary6Update.forEach(item => {
        const nomTransporteur = transporteursMap[item.transporterid];
        const existant = resultat.find(r => r.transporteur === nomTransporteur);
        const distanceInfo = distancesTrMap[item.transporterid];
        const lastHour = new Date(distanceInfo?.maxdates);
        const maxdates = dateInYyyyMmDdHhMmSs(lastHour)

        //console.log(distanceInfo);
        if (existant) {
            existant['Nombre de chauffeurs en 6 jours'] = item['Nombre de chauffeurs en 6 jours'];
        } else if (nomTransporteur) {
            resultat.push({
                transporteur: nomTransporteur,
                'Nombre de chauffeurs en 5 jours': 0,
                'Nombre de chauffeurs en 6 jours': item['Nombre de chauffeurs en 6 jours'],
                "Derniere mise a jour": maxdates
            });
        }
    });


    //const reposHebdodetails5 = await getpreventTestreposhebdo(5, false);
    const reposHebdodetails5 = await getpreventreposhebdo(5, false, ymaneTokenMada);
    const reposHebdoDetails5Update = reposHebdodetails5['resultat']?.map(item => {
        return {
            ...item,
            "Nombre de jours consecutifs": 5
        }
    })

    const reposHebdoDetails6 = await getpreventreposhebdo(6, false, ymaneTokenMada);
    //const reposHebdoDetails6 = await getpreventTestreposhebdo(6, false);
    const reposHebdoDetails6Update = reposHebdoDetails6['resultat']?.map(item => {
        return {
            ...item,
            "Nombre de jours consecutifs": 6
        }

    });


    //console.log(vehicules['resultat'][0]);
    //console.log(vehicules);
    const vehiculesMap = {};
    vehicules['resultat'].forEach(vehicule => {
        vehiculesMap[vehicule.vclid] = vehicule.vclenm;
    });

    //console.log(vehiculesMap)
    const distancesMap = {};
    lastDayDriving['resultat'].forEach(distance => {
        distancesMap[distance.driverid] = {
            maxdates: distance?.lastenddatetime,
            dist: distance.dist / 1000
        };
    });


    // Fusionner toutes les données
    const tousChauffeurs = [...reposHebdoDetails6Update, ...reposHebdoDetails5Update];
    //console.log(lastDayDriving);
    //console.log(tousChauffeurs);
    const result = {};

    tousChauffeurs.forEach(chauffeur => {
        //console.log(chauffeur);
        const nomTransporteur = transporteursMap[chauffeur.transporterid] || 'Transporteur inconnu';
        const nomVehicule = vehiculesMap[chauffeur.driverid] || 'Véhicule inconnu';
        const distanceInfo = distancesMap[chauffeur.driverid] || { maxdates: 'Date inconnue', dist: 0 };

        const lastHour = new Date(distanceInfo?.maxdates);
        const maxdates = dateInYyyyMmDdHhMmSs(lastHour)

        //console.log(nomVehicule);

        const cle = `${chauffeur.driverid}-${chauffeur.transporterid}`;

        if (!result[cle]) {
            result[cle] = {
                Transporteur: nomTransporteur,
                //Vehicule: nomVehicule,
                Chauffeur: chauffeur.name,
                'Nombre de jours consecutifs': chauffeur['Nombre de jours consecutifs'],
                'Dernier jour de conduite': maxdates,
                'Distance totale (km)': distanceInfo.dist.toFixed(2) + 'km'
            };
        } else {
            // Choisir le plus grand nombre de jours consécutifs
            if (chauffeur['Nombre de jours consecutifs'] > result[cle]['Nombre de jours consecutifs']) {
                result[cle]['Nombre de jours consecutifs'] = chauffeur['Nombre de jours consecutifs'];
            }
        }
    });


    const resultatFinal = Object.values(result);

    const titleDate = fistAndLastHourDay.dateTitle;
    const pathFile = 'rapport/Total/Repos-hebdoMADA';
    const columnFlotte = [{ key: "transporteur" }, { key: "Nombre de chauffeurs en 5 jours" }, { key: "Nombre de chauffeurs en 6 jours" }, { key: "Derniere mise a jour" }];
    const columnDriver = [{ key: "Transporteur" }, { key: "Chauffeur" }, { key: "Nombre de jours consecutifs" }, { key: "Dernier jour de conduite" }, { key: "Distance totale (km)" }];

    if (resultat && resultatFinal) {
        await convertJsonToExcelTotal(
            resultat,
            ' Feuille Etat Flotte',
            `${pathFile}-${titleDate}.xlsx`,
            columnFlotte
        ).then(
            setTimeout(async () => {

                await convertJsonToExcelTotal(
                    resultatFinal,
                    'Feuille Liste de chauffeurs',
                    `${pathFile}-${titleDate}.xlsx`,
                    columnDriver
                )
            }, 5000)
        )
            .then(() => {
                if (sender && receivers) {
                    setTimeout(() => {
                        sendMail(
                            sender,
                            receivers,
                            pass,
                            `${RAPPORT_REPOS_MADA}_${titleDate}`,
                            `${TOTAL_REPOS_HEBDO_SUBJECT_MAIL}`,
                            `${RAPPORT_REPOS_MADA}_${titleDate}.xlsx`,
                            path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
                        );
                        deleteFile(
                            path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
                        );
                    }, 30000);
                }
            })
    }


}


async function generateTotalMadaRepports() {

    console.log('load total MADA report');
    const hourScheduleRanking = await totalReceivers(MADA_RANKING_REPORT, 'F');
    // const hourScheduleNigth = await totalReceivers(CAMEROUN_NIGHT_DRIVING_REPORT, 'F');
    const hourScheduleCloture = await totalReceivers(MADA_CLOTURE_ACTIVITE, 'F');
    const hourScheduleRepos = await totalReceivers(MADA_REPOS_HEBDOMADAIRE, 'F');

    //const hourScheduleNigthHour = hourScheduleNigth[0].address.split(':')[0];
    const hourScheduleRankingHour = hourScheduleRanking[0].address.split(':');
    const hourScheduleReposHour = hourScheduleRepos[0].address.split(':')


    const now = moment().tz('Indian/Antananarivo');
    const madagascarRange = getMadagascarTimeRange(now, 0, 21);

    // console.log(hourScheduleRankingHour);
    //console.log(hourScheduleReposHour);

    //await generateTotalClotureRepport(madagascarRange.startFormatted, madagascarRange.endFormatted);
    //await generateTotalReposHebdo();
    //await generateNigthDrivingReport();
    //await generateTotalRankingRepport();

    cron.schedule('0 21 * * *', async () => {
        const nowMadagascar = moment().tz('Indian/Antananarivo');

        const madagascarRange = getMadagascarTimeRange(nowMadagascar, 0, 21);

        console.log(`Exécution du rapport à ${nowMadagascar.format('YYYY-MM-DD HH:mm:ss')}`);
        await generateTotalClotureRepport(madagascarRange.startFormatted, madagascarRange.endFormatted);
    }, {
        scheduled: true,
        timezone: 'Indian/Antananarivo'
    });


    cron.schedule(
        `${hourScheduleReposHour[1]} ${hourScheduleReposHour[0]} * * *`,
        async () => {
            await generateTotalReposHebdo();
        },
        {
            scheduled: true,
            timezone: 'Indian/Antananarivo'
        }
    );


    cron.schedule(
        `${hourScheduleRankingHour[1]} ${hourScheduleRankingHour[0]} 10 1,2,3,4,5,6,7,8,9,10,11,12 *`,
        async () => {
            await generateTotalRankingRepport();
        },
        {
            scheduled: true,
            timezone: 'Indian/Antananarivo'
        }
    );
}



module.exports = { generateTotalMadaRepports };
