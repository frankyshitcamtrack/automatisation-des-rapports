const path = require('path');
const cron = require('node-cron');
const { getTotalRepportData } = require('../models/total.model');
const { getTotalAfiliate, getTotalTransporter, getTotalTrucks, getPIO, getTotalNigths, allExceptionType, summaryException, summaryTrip, getTotalDrivers, getpreventreposhebdo, getpreventTestreposhebdo, getLastDriving, getLastDayTransporter } = require('../services/total.service')
const { getFistAndLastHourDay, getFistAndLastHourDay18H05H } = require('../utils/getFirstAndLastHourDay');
const { compensateDrivers } = require('../utils/fillsDriverFromArray');
const { mergeSimpleParkingData } = require('../utils/mergeTotalDataParking');
const { convertJsonToExcelTotal } = require('../utils/genrateXlsx');
const { processNightDrivingSimple } = require('../utils/processNigthDriving');
const { keepLatestNotifications } = require('../utils/removeDuplicateItemInArr');
const { analyzeDrivers } = require('../utils/summaryRanking');
const { generateFleetReport } = require('../utils/generateFleetReport')
const { Receivers } = require('../storage/mailReceivers.storage');
const { Senders } = require('../storage/mailSender.storage');
const { sendMail } = require('../utils/sendMail');
const { deleteFile } = require('../utils/deleteFile');
const { ADDAX_PETROLEUM, ALL_VEHICLE, LX_45 } = require('../constants/clients');
const { TOTAL_ENERGIES, OBC_TEMCM } = require('../constants/ressourcesClient');
const { STATUS_VEHICLE, STATUS_VEHICLE_NEW } = require('../constants/template');
const { STATUS, TRIP_END } = require('../constants/subGroups');
const { ADDAX_NOT_AT_PARKING_SUBJECT_MAIL } = require('../constants/mailSubjects');

const test = [{ name: 'frank', address: 'franky.shity@camtrack.net' }];

//const pass = process.env.PASS_MAIL;
const pass = process.env.PASS_MAIL_SAV;


async function generateNigthDrivingReport() {
    const totalTrucks = await getTotalTrucks();
    const totalTransporter = await getTotalTransporter();
    const totalAfiliate = await getTotalAfiliate();

    const firstHourLastNigth = getFistAndLastHourDay18H05H();
    const drivers = await getTotalDrivers()


    const fisrtHourNigth = firstHourLastNigth.firstHourDayFormat;
    const lastHourNigth = firstHourLastNigth.lasthourDayFormat;
    //const titleDate = firstHourLastNigth.dateTitle
    const titleDate = '2025-08-22'
    const pathFile = 'rapport/Total/Nigth';

    const column = [{ key: "filiale" }, { key: "transporteur" }, { key: "Vehicule" }, { key: "Driver" }, { key: "start point" }, { key: "end point" }, { key: "start date and time" }, { key: "Total duration" }, { key: "Exception" }, { key: "Niveau" }, { key: "Observation" }];

    const totalNigthsDriving = await getTotalNigths('2025-08-22 17:00:00', '2025-08-23 06:00:00');

    if (totalTrucks, totalTransporter, totalAfiliate) {
        const nigtDrivingData = processNightDrivingSimple(totalNigthsDriving["resultat"], drivers['resultat'], totalTrucks['resultat'], totalTransporter['resultat'], totalAfiliate['resultat'])

        await convertJsonToExcelTotal(
            nigtDrivingData,
            'Conduite de Nuit',
            `${pathFile}-${titleDate}.xlsx`,
            column
        )
    }
}



async function generateTotalClotureRepport() {
    const sender = await Senders(ADDAX_PETROLEUM, 'E');
    const receivers = await Receivers(ADDAX_PETROLEUM, 'D');
    const fistAndLastHourDay = getFistAndLastHourDay();

    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;

    const totalTrucks = await getTotalTrucks();

    const totalTransporter = await getTotalTransporter();
    const totalAfiliate = await getTotalAfiliate();

    const PIO = await getPIO();

    /*  const firstHourDay = "1749769200";
     const lastHourDay = "1749855540"; */
    const titleDate = fistAndLastHourDay.dateTitle;
    const pathFile = 'rapport/Total/Cloture';

    const AllDataStatusTripEnd = [];

    await getTotalRepportData(
        TOTAL_ENERGIES,
        STATUS_VEHICLE,
        ALL_VEHICLE,
        firstHourDay,
        lastHourDay,
        STATUS
    ).then(async (res) => {
        const objLenth = res?.obj.length;
        const tripEnd = await getTotalRepportData(
            TOTAL_ENERGIES,
            STATUS_VEHICLE,
            ALL_VEHICLE,
            firstHourDay,
            lastHourDay,
            TRIP_END
        )
        const OBCTripEnd = await getTotalRepportData(
            OBC_TEMCM,
            STATUS_VEHICLE_NEW,
            LX_45,
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
            STATUS
        )



        if (objLenth > 0 && tripEnd && OBCTripEnd) {

            const compensateDriver = compensateDrivers(res.obj, tripEnd.obj);
            const fullArr = compensateDrivers(compensateDriver, OBCTripEnd.obj);



            const column = [{ key: "Filiale" }, { key: "Transporteur" }, { key: 'Grouping' }, { key: 'Status Ignition' }, { key: 'Vitesse' }, { key: 'Dernier Conducteur' }, { key: 'Heure de Cloture' }, { key: 'Emplacement' }, { key: 'Coordonnées' }, { key: "Statut POI" }];
            const fleetColumn = [{ key: "Transporteur" }, { key: "Nombre De Camions" }, { key: "Etat flotte" }, { key: "Heure De cloture" }, { key: "Camions Hors POI" }, { key: "Derniere mise a jour" }];

            if (totalTrucks, totalTransporter, totalAfiliate, PIO) {
                const finalData = mergeSimpleParkingData(fullArr, totalTrucks["resultat"], totalTransporter["resultat"], totalAfiliate["resultat"]);

                const filterData = finalData.map(item => {
                    return { ...item, "Statut PIO": PIO.includes(item?.Emplacement?.text) ? "Dans POI" : "Hors POI" }
                });

                const removeDup = keepLatestNotifications(filterData);


                const listVehicleData = removeDup.map(item => {
                    const status = parseFloat(item['Status Ignition']);
                    const statusIgnition = !isNaN(status)
                        ? (status === 0 ? "OFF" : "ON")
                        : item['Status Ignition'];
                    return {
                        Filiale: item.Filiale ? item.Filiale : '--',
                        Transporteur: item.Transporteur ? item.Transporteur : '--',
                        Grouping: item.Grouping ? item.Grouping : '--',
                        'Status Ignition': item['Status Ignition'] ? statusIgnition : '--',
                        Vitesse: item.Vitesse ? item.Vitesse : '--',
                        'Dernier Conducteur': item.Conducteur ? item.Conducteur : '--',
                        'Heure de Cloture': item.Heure ? item.Heure : '--',
                        Emplacement: item.Emplacement ? item.Emplacement : '--',
                        Coordonnées: item['Coordonnées'] ? item['Coordonnées'] : '--',
                        'Statut POI': item['Statut PIO'] ? item['Statut PIO'] : '--'
                    }
                })

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

        }
    }

    )


        /*  .then(async (res) => {
 
             if (objLenth > 0) {
                
             } else {
                 console.log(
                     `no data found in ${STATUS_VEHICLE} ${STATUS}`
                 );
             }
         }) */

        .catch((err) => console.log(err));
}



async function generateTotalRankingRepport() {
    const sender = await Senders(ADDAX_PETROLEUM, 'E');
    const receivers = await Receivers(ADDAX_PETROLEUM, 'D');
    const fistAndLastHourDay = getFistAndLastHourDay();

    const firstHourDay = fistAndLastHourDay.firstHourDayFormat;
    const lastHourDay = fistAndLastHourDay.lasthourDayFormat;


    const getSummaryTrip = await summaryTrip(firstHourDay, lastHourDay);
    const getSummaryExceptions = await summaryException(firstHourDay, lastHourDay);
    const exceptionType = await allExceptionType()
    const drivers = await getTotalDrivers()


    const titleDate = fistAndLastHourDay.dateTitle;
    const pathFile = 'rapport/Total/Ranking';
    const column = [{ key: "Driver" }, { key: "Nombres d'Alertes Conduite de nuit" }, { key: "Nombres d'Alarme Conduite de nuit" }, { key: "Nombres d'Alertes conduite hebdomadaire" }, { key: "Nombres d'Alarme conduite hebdomadaire" }, { key: "Nombres d'Alertes Repos hebdomadaire" }, { key: "Nombres d'Alarme Repos hebdomadaire" }, { key: "Nombres d'Alertes Travail hebdomadaire" }, { key: "Nombres d'Alarme Travail hebdomadaire" }, { key: "Nombres d'Alertes HB" }, { key: "Nombres d'Alarme HB" }, { key: "Nombres d'Alertes HA" }, { key: "Nombres d'Alarme HA" }, { key: "Nombres de Téléphone au volant" }, { key: "Nombres de smoking" }, { key: "Nombres de Ceinture de Sécurité" }, { key: "Nombres de fatigues" }, { key: "Nombres de distraction" }, { key: "Nombre totale de points perdu sur la période" }, { key: "Distance totale Parcouru sur la période" }, { key: "Durée de Conduite sur la période" }, { key: "Ratio" }, { key: "Ranking" }];
    const rankinColumn = [{ key: "Driver" }, { key: "Ranking" }];

    if (drivers, getSummaryExceptions, exceptionType, getSummaryTrip) {
        const ranking = analyzeDrivers(drivers["resultat"], exceptionType, getSummaryExceptions['resultat'], getSummaryTrip['resultat']);

        if (ranking) {
            await convertJsonToExcelTotal(
                ranking?.rankingOnly,
                'Ranking Chauffeurs',
                `${pathFile}-${titleDate}.xlsx`,
                rankinColumn
            ).then(
                setTimeout(async () => {
                    await convertJsonToExcelTotal(
                        ranking?.detailedResults,
                        'Detail Ranking Chauffeurs',
                        `${pathFile}-${titleDate}.xlsx`,
                        column
                    )
                }, 5000)
            )
        }


    }


}


async function generateTotalReposHebdo() {
    const sender = await Senders(ADDAX_PETROLEUM, 'E');
    const receivers = await Receivers(ADDAX_PETROLEUM, 'D');
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

    //console.log(distancesTrMap);


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

    //console.log(resultat);




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
        )
    }


}


async function generateTotalRepports() {
    //await generateTotalClotureRepport();
    //await generateTotalReposHebdo()
    //await generateNigthDrivingReport();
    //await generateTotalRankingRepport()
    cron.schedule(
        '30 6 * * *',
        async () => {
            await generateTotalClotureRepport()
        },
        {
            scheduled: true,
            timezone: 'Africa/Lagos',
        }
    );


}



module.exports = { generateTotalRepports };
