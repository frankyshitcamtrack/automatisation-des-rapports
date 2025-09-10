const path = require('path');
const cron = require('node-cron');
const moment = require('moment');
const { getTotalRepportData } = require('../models/total.model');
const { getTotalAfiliate, getTotalTransporter, getTotalTrucks, getPIO, getTotalNigths, allExceptionType, summaryException, summaryTrip, getTotalDrivers, getpreventreposhebdo, getpreventTestreposhebdo, getLastDriving, getLastDayTransporter } = require('../services/total.service')
const { getFistAndLastHourDay, getFistAndLastHourDay18H05H, getFirstAndLastSevendays } = require('../utils/getFirstAndLastHourDay');
const {
    getFirstAndLastDayMonth,
} = require('../utils/getFistDayAndLastDayMonth');
const { convertDateToTimeStamp } = require('../utils/dateFormat')
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
const { ALL_VEHICLE, LX_45, CAMEROUN_RANKING_REPORT, CAMEROUN_NIGHT_DRIVING_REPORT, CAMEROUN_REPOS_HEBDOMADAIRE, CAMEROUN_CLOTURE_ACTIVITE, MDVR } = require('../constants/clients');
const { TOTAL_ENERGIES, OBC_TEMCM } = require('../constants/ressourcesClient');
const { STATUS_VEHICLE, STATUS_VEHICLE_NEW, RAPPORT_CLOTURE, RAPPORT_RANKING, RAPPORT_REPOS, RAPPORT_NIGHT_DRIVING } = require('../constants/template');
const { STATUS, TRIP_END, TRIP } = require('../constants/subGroups');
const { TOTAL_CLOTURE_SUBJECT_MAIL, TOTAL_RANKING_SUBJECT_MAIL, TOTAL_NIGTH_DRIVING_SUBJECT_MAIL, TOTAL_REPOS_HEBDO_SUBJECT_MAIL } = require('../constants/mailSubjects');

const test = [{ name: 'frank', address: 'franky.shity@camtrack.net' }];

//const pass = process.env.PASS_MAIL;
const pass = process.env.PASS_NOTIFICATION;

function getStartDateForNight(now) {
    // Si on est entre 00:00 et 03:00, la nuit a commencé la veille à 21h
    if (now.hour() < 3) {
        return now.clone().subtract(1, 'day').startOf('day'); // 00:00 du jour précédent
    }
    // Sinon, on est entre 21h-23h, donc startDate = 00:00 du jour même
    return now.clone().startOf('day');
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
async function generateNigthDrivingReport() {
    const sender = await totalSenders(CAMEROUN_NIGHT_DRIVING_REPORT, 'B');
    const receivers = await totalReceivers(CAMEROUN_NIGHT_DRIVING_REPORT, 'C');

    const totalTrucks = await getTotalTrucks();
    const totalTransporter = await getTotalTransporter();
    const totalAfiliate = await getTotalAfiliate();

    const firstHourLastNigth = getFistAndLastHourDay18H05H();
    const drivers = await getTotalDrivers()


    const fisrtHourNigth = firstHourLastNigth.firstHourDayFormat;
    const lastHourNigth = firstHourLastNigth.lasthourDayFormat;
    const titleDate = firstHourLastNigth.dateTitle
    const pathFile = 'rapport/Total/Nigth';

    const column = [{ key: "filiale" }, { key: "transporteur" }, { key: "Vehicule" }, { key: "Driver" }, { key: "start point" }, { key: "end point" }, { key: "start date and time" }, { key: "end date and time" }, { key: "Total duration" }, { key: "Exception" }, { key: "Niveau" }, { key: "Observation" }];

    const totalNigthsDriving = await getTotalNigths(fisrtHourNigth, lastHourNigth);


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


//cloture
async function generateTotalClotureRepport(firstDate, lastDate) {
    const sender = await totalSenders(CAMEROUN_CLOTURE_ACTIVITE, 'B');
    const receivers = await totalReceivers(CAMEROUN_CLOTURE_ACTIVITE, 'C');


    // const fistAndLastHourDay = getFistAndLastHourDay();

    const firstHourDay = convertDateToTimeStamp(firstDate);
    const lastHourDay = convertDateToTimeStamp(lastDate);

    const totalTrucks = await getTotalTrucks();

    const totalTransporter = await getTotalTransporter();
    const totalAfiliate = await getTotalAfiliate();

    const PIO = await getPIO();

    const safeFirst = formatDateForFilename(firstDate);
    const safeLast = formatDateForFilename(lastDate);


    const titleDate = `${safeLast}`
    const pathFile = 'rapport/Total/Cloture';


    await getTotalRepportData(
        TOTAL_ENERGIES,
        STATUS_VEHICLE,
        MDVR,
        firstHourDay,
        lastHourDay,
        TRIP
    )
        .then(async (res) => {
            const objLenth = res?.obj.length;

            //console.log(res?.obj);
            //const filterVhleY = res?.obj.filter(item => item.Grouping === 'LTTR 821 AT')

            //console.log(filterVhleY);


            const tripEnd = await getTotalRepportData(
                TOTAL_ENERGIES,
                STATUS_VEHICLE,
                ALL_VEHICLE,
                firstHourDay,
                lastHourDay,
                TRIP_END
            )

            const OBCstatus = await getTotalRepportData(
                OBC_TEMCM,
                STATUS_VEHICLE_NEW,
                LX_45,
                firstHourDay,
                lastHourDay,
                TRIP
            )

            if (objLenth > 0 && tripEnd && OBCstatus) {

                const compensateDriver = compensateDrivers(res.obj, tripEnd.obj);
                const compensateDriver2 = compensateDrivers(compensateDriver, tripEnd.obj)
                const fullArr = [...compensateDriver2, ...OBCstatus.obj]



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

                        //console.log(rawCoordonnees);

                        const cleanedItem = {
                            Filiale: item.Filiale && !isEmptyValue(item.Filiale) ? item.Filiale : '--',
                            Transporteur: item.Transporteur && !isEmptyValue(item.Transporteur) ? item.Transporteur : '--',
                            Grouping: item.Grouping && !isEmptyValue(item.Grouping) ? item.Grouping : '--',
                            'Status Ignition': parseFloat(rawIgnition) === 0 ? "OFF" : 'ON',
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
                        `${RAPPORT_CLOTURE}_${titleDate}`,
                        `${TOTAL_CLOTURE_SUBJECT_MAIL}`,
                        `${RAPPORT_CLOTURE}_${titleDate}.xlsx`,
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
    const sender = await totalSenders(CAMEROUN_RANKING_REPORT, 'B');
    const receivers = await totalReceivers(CAMEROUN_RANKING_REPORT, 'C');

    const fistAndLastHourDay = getFirstAndLastDayMonth();

    const firstHourDay = fistAndLastHourDay.fistDayFormat;
    const lastHourDay = fistAndLastHourDay.lastDayFormat;


    const getSummaryTrip = await summaryTrip(firstHourDay, lastHourDay);
    const getSummaryExceptions = await summaryException(firstHourDay, lastHourDay);
    const exceptionType = await allExceptionType();
    const drivers = await getTotalDrivers();
    const transporter = await getTotalTransporter()


    const titleDate = fistAndLastHourDay.dateTitle;
    const splitTitle = titleDate.split('-')
    const pathFile = 'rapport/Total/Ranking';
    const column = [{ key: "Driver" }, { key: 'Transporteur' }, { key: "Nombres d'Alertes Conduite de nuit" }, { key: "Nombres d'Alarme Conduite de nuit" }, { key: "Nombres d'Alertes conduite hebdomadaire" }, { key: "Nombres d'Alertes Repos hebdomadaire" }, { key: "Nombres d'Alarme Repos hebdomadaire" }, { key: "Nombres d'Alertes Travail hebdomadaire" }, { key: "Nombres d'Alarme Travail hebdomadaire" }, { key: "Nombres d'Alertes Travail journalier" }, { key: "Nombres d'Alarme Travail journalier" }, { key: "Nombres d'Alertes Conduite continue" }, { key: "Nombres d'Alarme Conduite continue" }, { key: "Nombres d'Alertes HB" }, { key: "Nombres d'Alarme HB" }, { key: "Nombres d'Alertes HA" }, { key: "Nombres d'Alarme HA" }, { key: "Nombres de Téléphone au volant" }, { key: "Nombres de smoking" }, { key: "Nombres de Ceinture de Sécurité" }, { key: "Nombres de fatigues" }, { key: "Nombres de distraction" }, { key: "Nombre totale de points perdu sur la période" }, { key: "Distance totale Parcouru sur la période (km)" }, { key: "Durée de Conduite sur la période" }, { key: "Durée de Conduite sur la période en heure" }, { key: "Ratio" }, { key: "Ranking" }];
    const rankinColumn = [{ key: "Ranking" }, { key: "Driver" }, { key: 'Transporteur' }, { key: 'Nombre de points perdus au 100km' }];
    const rankinColumnTransporterDetail = [{ key: "Transporteur" }, { key: "Nombres d'Alertes Conduite de nuit" }, { key: "Nombres d'Alarme Conduite de nuit" }, { key: "Nombres d'Alertes conduite hebdomadaire" }, { key: "Nombres d'Alertes Repos hebdomadaire" }, { key: "Nombres d'Alarme Repos hebdomadaire" }, { key: "Nombres d'Alertes Travail hebdomadaire" }, { key: "Nombres d'Alarme Travail hebdomadaire" }, { key: "Nombres d'Alertes Travail journalier" }, { key: "Nombres d'Alarme Travail journalier" }, { key: "Nombres d'Alertes Conduite continue" }, { key: "Nombres d'Alarme Conduite continue" }, { key: "Nombres d'Alertes HB" }, { key: "Nombres d'Alarme HB" }, { key: "Nombres d'Alertes HA" }, { key: "Nombres d'Alarme HA" }, { key: "Nombres de Téléphone au volant" }, { key: "Nombres de smoking" }, { key: "Nombres de Ceinture de Sécurité" }, { key: "Nombres de fatigues" }, { key: "Nombres de distraction" }, { key: "Nombre totale de points perdu sur la période" }, { key: "Distance totale Parcouru sur la période (km)" }, { key: "Durée de Conduite sur la période" }, { key: "Durée de Conduite sur la période en heure" }, { key: "Ratio" }, { key: "Ranking" }];
    const columnRankingTransporter = [{ key: "Ranking" }, { key: "Transporteur" }, { key: 'Nombre de points perdus au 100km' }];



    if (drivers, getSummaryExceptions, exceptionType, getSummaryTrip) {
        const ranking = analyzeDrivers(drivers["resultat"], exceptionType, getSummaryExceptions['resultat'], getSummaryTrip['resultat'], transporter['resultat']);

        /*    await legendeRankingTotal(
               `${pathFile}-${titleDate}.xlsx`,
               'Legende',
           ).then(() => { console.log('generated legend') });
    */

        if (ranking) {

            await convertJsonToExcelTotal(
                ranking?.rankingOnlyByCarrier,
                'Ranking Transporteur',
                `${pathFile}-${titleDate}.xlsx`,
                columnRankingTransporter
            )
                .then(
                    setTimeout(
                        async () => {
                            await convertJsonToExcelTotal(
                                ranking?.rankingOnly,
                                'Ranking Chauffeurs',
                                `${pathFile}-${titleDate}.xlsx`,
                                rankinColumn
                            )
                        }, 5000
                    )

                ).then(
                    setTimeout(async () => {
                        await convertJsonToExcelTotal(
                            ranking?.detailedResultsByCarrier,
                            'Detail Ranking Transporteur',
                            `${pathFile}-${titleDate}.xlsx`,
                            rankinColumnTransporterDetail
                        )
                    }, 20000)
                ).then(
                    setTimeout(async () => {
                        await convertJsonToExcelTotal(
                            ranking?.detailedResults,
                            'Detail Ranking Chauffeurs',
                            `${pathFile}-${titleDate}.xlsx`,
                            column
                        )
                    }, 30000)
                )
                .then(() => {
                    if (sender && receivers) {
                        setTimeout(() => {
                            sendMail(
                                sender,
                                receivers,
                                pass,
                                `${RAPPORT_RANKING}_${splitTitle[1]}_${splitTitle[0]}`,
                                `${TOTAL_RANKING_SUBJECT_MAIL}`,
                                `${RAPPORT_RANKING}__${splitTitle[1]}_${splitTitle[0]}.xlsx`,
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
    const sender = await totalSenders(CAMEROUN_REPOS_HEBDOMADAIRE, 'B');
    const receivers = await totalReceivers(CAMEROUN_REPOS_HEBDOMADAIRE, 'C');


    const fistAndLastHourDay = getFistAndLastHourDay();

    const transporteurs = await getTotalTransporter();
    const vehicules = await getTotalTrucks();
    const lastDayDriving = await getLastDriving();
    const lastDayTransporter = await getLastDayTransporter()

    const reposHebdoSummary5 = await getpreventreposhebdo(5, true);
    //const reposHebdoSummary5 = await getpreventTestreposhebdo(5, true);
    const reposHebdoSummary5Update = reposHebdoSummary5['resultat']?.map(item => {
        return {
            transporterid: item.transporterid,
            "Nombre de chauffeurs en 5 jours": item?.count
        }
    })

    const reposHebdoSummary6 = await getpreventreposhebdo(6, true);
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


    // Fusionner les données
    const resultat = [];

    // Traiter les chauffeurs avec 5 jours
    reposHebdoSummary5Update.forEach(item => {
        const nomTransporteur = transporteursMap[item.transporterid];
        const distanceInfo = distancesTrMap[item.transporterid];

        if (nomTransporteur) {
            resultat.push({
                transporteur: nomTransporteur,
                'Nombre de chauffeurs en 5 jours': item['Nombre de chauffeurs en 5 jours'],
                'Nombre de chauffeurs en 6 jours': 0,
                "Derniere mise a jour": distanceInfo.maxdates

            });
        }
    });

    // Traiter les chauffeurs avec 6 jours
    reposHebdoSummary6Update.forEach(item => {
        const nomTransporteur = transporteursMap[item.transporterid];
        const existant = resultat.find(r => r.transporteur === nomTransporteur);
        const distanceInfo = distancesTrMap[item.transporterid];
        if (existant) {
            existant['Nombre de chauffeurs en 6 jours'] = item['Nombre de chauffeurs en 6 jours'];
        } else if (nomTransporteur) {
            resultat.push({
                transporteur: nomTransporteur,
                'Nombre de chauffeurs en 5 jours': 0,
                'Nombre de chauffeurs en 6 jours': item['Nombre de chauffeurs en 6 jours'],
                "Derniere mise a jour": distanceInfo.maxdates
            });
        }
    });


    //const reposHebdodetails5 = await getpreventTestreposhebdo(5, false);
    const reposHebdodetails5 = await getpreventreposhebdo(5, false);
    const reposHebdoDetails5Update = reposHebdodetails5['resultat']?.map(item => {
        return {
            ...item,
            "Nombre de jours consecutifs": 5
        }
    })

    const reposHebdoDetails6 = await getpreventreposhebdo(6, false);
    //const reposHebdoDetails6 = await getpreventTestreposhebdo(6, false);
    const reposHebdoDetails6Update = reposHebdoDetails6['resultat']?.map(item => {
        return {
            ...item,
            "Nombre de jours consecutifs": 6
        }

    });


    const vehiculesMap = {};
    vehicules['resultat'].forEach(vehicule => {
        vehiculesMap[vehicule.vclid] = vehicule.vclenm;
    });

    const distancesMap = {};
    lastDayDriving['resultat'].forEach(distance => {
        distancesMap[distance.driverid] = {
            maxdates: distance.maxdates,
            dist: distance.dist / 1000
        };
    });

    // Fusionner toutes les données
    const tousChauffeurs = [...reposHebdoDetails6Update, ...reposHebdoDetails5Update];
    const result = {};

    tousChauffeurs.forEach(chauffeur => {
        const nomTransporteur = transporteursMap[chauffeur.transporterid] || 'Transporteur inconnu';
        const nomVehicule = vehiculesMap[chauffeur.driverid] || 'Véhicule inconnu';
        const distanceInfo = distancesMap[chauffeur.driverid] || { maxdates: 'Date inconnue', dist: 0 };

        const cle = `${chauffeur.driverid}-${chauffeur.transporterid}`;

        if (!result[cle]) {
            result[cle] = {
                Transporteur: nomTransporteur,
                Vehicule: nomVehicule,
                Chauffeur: chauffeur.name,
                'Nombre de jours consecutifs': chauffeur['Nombre de jours consecutifs'],
                'Dernier jour de conduite': distanceInfo.maxdates,
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
    const pathFile = 'rapport/Total/Repos-hebdo';
    const columnFlotte = [{ key: "transporteur" }, { key: "Nombre de chauffeurs en 5 jours" }, { key: "Nombre de chauffeurs en 6 jours" }, { key: "Derniere mise a jour" }];
    const columnDriver = [{ key: "Transporteur" }, { key: "Vehicule" }, { key: "Chauffeur" }, { key: "Nombre de jours consecutifs" }, { key: "Dernier jour de conduite" }, { key: "Distance totale (km)" }];

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
        ).then(() => {
            if (sender && receivers) {
                setTimeout(() => {
                    sendMail(
                        sender,
                        receivers,
                        pass,
                        `${RAPPORT_REPOS}_${titleDate}`,
                        `${TOTAL_REPOS_HEBDO_SUBJECT_MAIL}`,
                        `${RAPPORT_REPOS}_${titleDate}.xlsx`,
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


async function generateTotalRepports() {

    console.log('load total report');
    const hourScheduleRanking = await totalReceivers(CAMEROUN_RANKING_REPORT, 'F');
    const hourScheduleNigth = await totalReceivers(CAMEROUN_NIGHT_DRIVING_REPORT, 'F');
    const hourScheduleCloture = await totalReceivers(CAMEROUN_CLOTURE_ACTIVITE, 'F');
    const hourScheduleRepos = await totalReceivers(CAMEROUN_REPOS_HEBDOMADAIRE, 'F');

    const hourScheduleNigthHour = hourScheduleNigth[0].address.split(':')[0];
    const hourScheduleRankingHour = hourScheduleRanking[0].address.split(':');
    const hourScheduleReposHour = hourScheduleRepos[0].address.split(':')



    //await generateTotalClotureRepport('2025-09-05 00:00:00', '2025-09-06 03:00:00')
    //await generateTotalReposHebdo();
    //await generateNigthDrivingReport();
    //await generateTotalRankingRepport();

    cron.schedule('0 21-23,0-3 * * *', async () => {
        const now = moment();
        const startDate = getStartDateForNight(now);
        const endDate = now.clone().startOf('hour');

        await generateTotalClotureRepport(
            startDate.format('YYYY-MM-DD HH:mm:ss'),
            endDate.format('YYYY-MM-DD HH:mm:ss')
        )
    }, {
        scheduled: true,
        timezone: 'Africa/Lagos',
    });

    cron.schedule(
        `${hourScheduleReposHour[1]} ${hourScheduleReposHour[0]} * * *`,
        async () => {
            await generateTotalReposHebdo();
        },
        {
            scheduled: true,
            timezone: 'Africa/Lagos',
        }
    );

    cron.schedule(
        `00 ${hourScheduleNigthHour} * * *`,
        async () => {
            await generateNigthDrivingReport();
        },
        {
            scheduled: true,
            timezone: 'Africa/Lagos',
        }
    );


    cron.schedule(
        `${hourScheduleRankingHour[1]} ${hourScheduleRankingHour[0]} * * *`,
        async () => {
            await generateTotalRankingRepport();
        },
        {
            scheduled: true,
            timezone: 'Africa/Lagos',
        }
    );
}



module.exports = { generateTotalRepports };
