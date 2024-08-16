const path = require('path');
const cron = require('node-cron');
const _ = require('lodash');
const { getRepportData,getRepportDataUnit } = require('../models/models');
const { getFistAndLastHourDay,getFirstAndLastSevendays } = require('../utils/getFirstAndLastHourDay');
const { addAffectationsColumn } = require('../utils/createAffectationcolumnperenco');
const { zoneExcesDeVitesse } = require('../utils/addTypeZoneExcesVitesse');
const { addCriticiteProps,addCriticiteAndVitesseLimiteProps } = require('../utils/createCriticitecol');
const { addIntervalles } = require('../utils/createIntervallesColl');
const { addWeekendStatus } = require('../utils/addWeekendStatus');
const { utilisateurNullEcodriving, utilisateurNullDetailTrajet, utilisateurNullConduiteDeNuit, utilisateurNullExcesVitess } = require('../utils/replaceUtilisateurNull')
const { perencoXlsx, generateSyntheseSheetPerenco } = require('../utils/genrateXlsx');
const {removeProperties} = require('../utils/removeProperties');
const {deleteFile}=require('../utils/deleteFile')
const { calculateTime } = require('../utils/sommeArrTimes')
const { Receivers } = require('../storage/mailReceivers.storage');
const { Senders } = require('../storage/mailSender.storage')
const { sendMail } = require('../utils/sendMail');
const { PERENCO } = require('../constants/clients');
const { ADMIN_PERENCO } = require('../constants/ressourcesClient');
const {ACTIVITY_REPORT_SUBJECT_MAIL_PERENCO_DAY,ACTIVITY_REPORT_SUBJECT_MAIL_PERENCO_WEEK,ACTIVITY_REPORT_SUBJECT_MAIL_PERENCO_TRACKING,ACTIVITY_REPORT_SUBJECT_MAIL_PERENCO_TRAVERSER, ACTIVITY_REPORT_SUBJECT_MAIL_PERENCO_EXCES_VITESSE}=require('../constants/mailSubjects');
const { RAPPORT_ACTIVITE_FLOTTE_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE,RAPPORT_TRAVERSE_ZONE_BONABERI } = require('../constants/template');
const pass = process.env.PASS_MAIL_YAMDEU;

const {
  ECO_DRIVING,
  DETAIL_TRAJET,
  CONDUITE_DE_NUIT,
  SPEEDING_DETAIL,
  EXCES_DE_VITESSE_LEGERE_HORS_VILLE,
  EXCES_DE_VITESSE_LEGERE_NAT3_VILLE,
  EXCES_DE_VITESSE_LEGERE_VILLE,
  EXCES_DE_VITESSE_SEVERE_HORS_VILLE,
  EXCES_DE_VITESSE_SEVERE_NAT3_VILLE,
  EXCES_DE_VITESSE_SEVERE_VILLE,
  ZONES,
  SYNTHESE,
  TRACKING_TRACAFIC
} = require('../constants/subGroups');

const { json } = require('body-parser');


async function generateDaylyRepportPerenco() {
  try {
    const synthese = []
    const sender = await Senders(PERENCO, 'E');
    const receivers = await Receivers(PERENCO, 'D'); 
    const fistAndLastHourDay = getFistAndLastHourDay();
    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;

    const titleDate = fistAndLastHourDay.dateTitle;
    const pathFile = "rapport/Perenco/RAPPORT-ACTIVITE-FLOTTE-PERENCO";

    await getRepportData(ADMIN_PERENCO, RAPPORT_ACTIVITE_FLOTTE_PERENCO, PERENCO, firstHourDay, lastHourDay, ECO_DRIVING)
      .then(async (res) => {
        const objLenth = res?.obj.length;
        if (objLenth > 0) {
          const data = res.obj;
          const column = res.excelColum;

          //add affectations properties to data
          const dataWithAffectationColumn = addAffectationsColumn(data);

          const rangeData = dataWithAffectationColumn.map(item => {
            if (item) {
              return {
                Grouping: item.Grouping,
                Affectations: item.Affectations,
                Conducteur: item.Conducteur,
                Infraction: item.Infraction,
                Valeur: item.Valeur,
                Début: item['Début'],
                "Emplacement initial": item['Emplacement initial'],
                Fin: item['Fin'],
                "Lieu d'arrivée": item["Lieu d'arrivée"],
                "Vitesse maxi": item['Vitesse maxi'],
                'Violation duration': item['Violation duration'],
                 Kilométrage: item['Kilométrage'],
              }
            }
          });

          const updateDataWithoutUser = utilisateurNullEcodriving(rangeData);
 
          updateDataWithoutUser.map(item => {
            if (item) {
              const newItem = { ...item, template: 'exception' }
              synthese.push(newItem)
            }
          });

          //add affectation header at the 1 index
          column.splice(1, 0, { key: 'Affectations' });

          await perencoXlsx(updateDataWithoutUser, ECO_DRIVING, `${pathFile}-${titleDate}.xlsx`, column);

        } else {
          console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${ECO_DRIVING}`);
        }
      })
     .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_ACTIVITE_FLOTTE_PERENCO, PERENCO, firstHourDay, lastHourDay, DETAIL_TRAJET)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);
              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    Début: item['Début'],
                    'Lieu de Départ': item['Lieu de Départ'],
                    Fin: item.Fin,
                    "Lieu d'arrivée": item["Lieu d'arrivée"],
                    Durée: item['Durée'],
                    'En mouvement': item['En mouvement'],
                    'Ralenti moteur': item['Ralenti moteur'],
                    Distance: item.Distance,
                    'Temps total': item['Temps total'],
                    Arrêts: item['Arrêts'],
                    'Vitesse maxi': item['Vitesse maxi'],
                  }
                }
              });

              const addWeekend = await addWeekendStatus(rangeData);

              const updateDataWithoutUser = utilisateurNullDetailTrajet(addWeekend)
              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              updateDataWithoutUser.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'trajet' }
                  synthese.push(newItem)
                }
              });

              await perencoXlsx(updateDataWithoutUser, DETAIL_TRAJET, `${pathFile}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${DETAIL_TRAJET}`);
            }
          })
          .catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_ACTIVITE_FLOTTE_PERENCO, PERENCO, firstHourDay, lastHourDay, CONDUITE_DE_NUIT)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);

              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Début': item['Début'],
                    'Lieu de Départ': item['Lieu de Départ'],
                    Fin: item.Fin,
                    "Lieu d'arrivée": item["Lieu d'arrivée"],
                    'Durée': item['Durée'],
                    'En mouvement': item['En mouvement'],
                    'Ralenti moteur': item['Ralenti moteur'],
                    Distance: item.Distance,
                    'Vitesse maxi': item['Vitesse maxi'],
                  }
                }
              });

              const updateDataWithoutUser = utilisateurNullConduiteDeNuit(rangeData);

              const createIntervallesCol = addIntervalles(updateDataWithoutUser);

              createIntervallesCol.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'conduiteNuit' }
                  synthese.push(newItem);
                }

              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              column.splice(3, 0, { key: 'Intervalles' });

              await perencoXlsx(createIntervallesCol, CONDUITE_DE_NUIT, `${pathFile}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${CONDUITE_DE_NUIT}`);
            }
          }).catch(err => console.log(err))
      })  
      .then(async () => {
        await getRepportData(ADMIN_PERENCO,RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_LEGERE_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
             

              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);

              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée'],
                  }
                }
              });
              

              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);
             
              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_LEGERE_VILLE);
              
              const newArrData = addCriticiteProps(arrDataWithZone);
    
              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'villeLegere' }
                  synthese.push(newItem);
                }

              });

             
              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });
              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_LEGERE_VILLE}`);
            }
          }).catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_SEVERE_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);

              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée'],
                  }
                }
              });


              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_SEVERE_VILLE);

              const newArrData = addCriticiteProps(arrDataWithZone);

              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'villeSevere' }
                  synthese.push(newItem);
                }
              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });

              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_SEVERE_VILLE}`);
            }
          }).catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_LEGERE_HORS_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);

              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et Heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée']
                  }
                }
              });

              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);


              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_LEGERE_HORS_VILLE);

              const newArrData = addCriticiteProps(arrDataWithZone);



              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'horsVilleLegere' }
                  synthese.push(newItem);
                }

              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });

              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_LEGERE_HORS_VILLE}`);
            }
          }).catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_SEVERE_HORS_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);
              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et Heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée']
                  }
                }
              });

              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_SEVERE_HORS_VILLE);

              const newArrData = addCriticiteProps(arrDataWithZone);

              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'horsVilleSevere' }
                  synthese.push(newItem);
                }
              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });

              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_SEVERE_HORS_VILLE}`);
            }
          }).catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_LEGERE_NAT3_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);
              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et Heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée']
                  }
                }
              });

              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);


              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_LEGERE_NAT3_VILLE);

              const newArrData = addCriticiteProps(arrDataWithZone);

              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'legereNat3' }
                  synthese.push(newItem);
                }

              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });

              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_LEGERE_NAT3_VILLE}`);
            }
          }).catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_SEVERE_NAT3_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);
              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée']
                  }
                }
              });

              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_SEVERE_NAT3_VILLE);

              const newArrData = addCriticiteProps(arrDataWithZone);

              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'severeNat3' }
                  synthese.push(newItem);
                }
              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });

              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);

            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_SEVERE_NAT3_VILLE}`);
            }
          }).catch(err => console.log(err))
      })  
      .then(
        async() => {

          //Group notifications By VehicleID
          const groupItemByVehicleGroup = _.groupBy(synthese, synth => synth['Grouping']);
  
          //change objects to arr and remove key 
          const arrData = Object.keys(groupItemByVehicleGroup).map((key) => {
            return Object.values(groupItemByVehicleGroup[[key]]);
          });
  
  
          const groupArrByTemplate = arrData.map(item => {
            const group = _.groupBy(item, it => it['template']);
            return group
          })
  
          //change objects to arr and remove key 
          const arrGroup = Object.keys(groupArrByTemplate).map((key) => {
            return Object.values(groupArrByTemplate[[key]]);
          });
  
  
          const syntheseServices = arrGroup.map(item => {
            return item.map(it => {
              if (it[0]['template'] === 'exception') {
                const severalHarshAcceleration = it.filter(item => item["Infraction"] === "Several Harsh Acceleration").length;
                const harshAcceleration = it.filter(item => item["Infraction"] === "Harsh Acceleration").length;
                const harshTurn = it.filter(item => item["Infraction"] === "Harsh Turn").length;
                const severalHarshTurn = it.filter(item => item["Infraction"] === "Several Harsh Turn").length;
                const severalHarshBrake = it.filter(item => item["Infraction"] === "Several Harsh Brake").length;
                const harshBrake = it.filter(item => item["Infraction"] === "Harsh brake").length
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Several Harsh Acceleration": severalHarshAcceleration || 0,
                  "Harsh Acceleration": harshAcceleration || 0,
                  "Harsh Turn": harshTurn || 0,
                  "Several Harsh Turn": severalHarshTurn || 0,
                  "Several Harsh Brake": severalHarshBrake || 0,
                  "Harsh Brake": harshBrake || 0
                }
              }
              if (it[0]['template'] === 'trajet') {
                const totalTime = calculateTime(it);
                const totalDistance = it.reduce((acc, item) => acc + parseFloat(item['Distance']), 0).toFixed(2);
                const itemWithWeekendStatus = it.filter(item => item.weekend === true);
                const totalTimeWeekends = calculateTime(itemWithWeekendStatus);
                const totalDistanceWeekends = itemWithWeekendStatus.reduce((acc, item) => acc + parseFloat(item['Distance']), 0).toFixed(2)
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  Distance: totalDistance || 0,
                  Duration: totalTime || 0,
                  Distances: totalDistanceWeekends || 0,
                  Durations: totalTimeWeekends || 0
                }
              }
  
              if (it[0]['template'] === 'conduiteNuit') {
                const el = it[0];
                const conduiteNuit1 = it.filter(item => item.Intervalles === "22H-24H").length;
                const conduiteNuit2 = it.filter(item => item.Intervalles === "24H-04H").length;
                return {
                  "Grouping": el.Grouping,
                  "Affectations": el.Affectations,
                  "Conducteur": el.Conducteur,
                  "22H24H": conduiteNuit1,
                  "24H04H": conduiteNuit2
                }
              }
  
              if (it[0]['template'] === 'villeLegere') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                   "Legere-Ville": it.length || 0 
                }
              }
  
              if (it[0]['template'] === 'villeSevere') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Severe-Ville": it.length || 0
                }
              }
  
              if (it[0]['template'] === 'horsVilleSevere') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Severe-HorsVille": it.length || 0
                }
              }
  
              if (it[0]['template'] === 'horsVilleLegere') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Legere-HorsVille": it.length || 0
                }
              }
  
  
              if (it[0]['template'] === 'severeNat3') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Severe-Nat3": it.length || 0
                }
              }
  
              if (it[0]['template'] === 'legereNat3') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Legere-Nat3": it.length || 0
                }
              }
  
            })
          })
  
          //Merge objects Arr
          const mergObjects = syntheseServices.map(item => {
            return item.reduce(((r, c) => Object.assign(r, c)), {})
          })
  
  
          //Range service 
          const finalService = mergObjects.map(item => {
            return {
              "Imatriculations": item["Grouping"],
              "Affectations": item["Affectations"],
              "Utilisateurs": item["Conducteur"],
              "Distance": item["Distance"] || 0,
              "Duration": item["Duration"] || 0,
              "Harsh Acceleration": item["Harsh Acceleration"] || 0,
              "Several Acceleration": item["Several Harsh Acceleration"] || 0,
              "Harsh Turn": item["Harsh Turn"] || 0,
              "Several Turn": item["Several Harsh Turn"] || 0,
              "Harsh Brake": item["Harsh Brake"] || 0,
              "Several Brake": item["Several Harsh Brake"] || 0,
              "22H24H": item["22H24H"] || 0,
              "24H04H": item["24H04H"] || 0,
              "Distances": item["Distances"] || 0,
              "Durations": item["Durations"] ||`00:00:00`,
              "Severe-Ville": item["Severe-Ville"] || 0,
              "Legere-Ville": item["Legere-Ville"] || 0,
              "Severe-HorsVille": item["Severe-HorsVille"] || 0,
              "Legere-HorsVille": item["Legere-HorsVille"] || 0,
              "Severe-Nat3": item["Severe-Nat3"] || 0,
              "Legere-Nat3": item["Legere-Nat3"] || 0,
            }
          })
          await generateSyntheseSheetPerenco(`${pathFile}-${titleDate}.xlsx`,finalService, SYNTHESE);
        }
      ) 
  
    .then(()=>{
            if (sender && receivers) {
              setTimeout(() => {
                sendMail(sender,receivers,pass, RAPPORT_ACTIVITE_FLOTTE_PERENCO, `${ACTIVITY_REPORT_SUBJECT_MAIL_PERENCO_DAY}`,`${RAPPORT_ACTIVITE_FLOTTE_PERENCO}.xlsx`, path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
                deleteFile(path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
              }, 30000)
            } 
          })    
      .catch(err => console.log(err))


  } catch (err) {
    console.error(err)
  }

}


async function generateHebdoRepportPerenco() {
  try {
    const synthese = []
    const sender = await Senders(PERENCO, 'E');
    const receivers = await Receivers(PERENCO, 'D');  
    const fistAndLastHourDay = getFirstAndLastSevendays();
    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;
    const titleDate = fistAndLastHourDay.dateTitle;
    const pathFile = "rapport/Perenco/RAPPORT-ACTIVITE-HEBDO-FLOTTE-PERENCO";
    const pathTracking ="rapport/Perenco/TRACKING-TRACAFIC";
    const pathFileExcesVitesse="rapport/Perenco/RAPPORT-EXCES-VITSSE-HEBDO-FLOTTE-PERENCO";
    const pathFileHorsZoneBonaberi="rapport/Perenco/fonction-ayant-traversé-le-pont-de-bonaberi";

    await getRepportData(ADMIN_PERENCO, RAPPORT_ACTIVITE_FLOTTE_PERENCO, PERENCO, firstHourDay, lastHourDay, ECO_DRIVING)
      .then(async (res) => {
        const objLenth = res?.obj.length;
        if (objLenth > 0) {
          const data = res.obj;
          const column = res.excelColum;

          //add affectations properties to data
          const dataWithAffectationColumn = addAffectationsColumn(data);

          const rangeData = dataWithAffectationColumn.map(item => {
            if (item) {
              return {
                Grouping: item.Grouping,
                Affectations: item.Affectations,
                Conducteur: item.Conducteur,
                Infraction: item.Infraction,
                Valeur: item.Valeur,
                Début: item['Début'],
                "Emplacement initial": item['Emplacement initial'],
                Fin: item['Fin'],
                "Lieu d'arrivée": item["Lieu d'arrivée"],
                "Vitesse maxi": item['Vitesse maxi'],
                'Violation duration': item['Violation duration'],
                 Kilométrage: item['Kilométrage']
              }
            }
          });

          const updateDataWithoutUser = utilisateurNullEcodriving(rangeData);

          updateDataWithoutUser.map(item => {
            if (item) {
              const newItem = { ...item, template: 'exception' }
              synthese.push(newItem)
            }
          });

          //add affectation header at the 1 index
          column.splice(1, 0, { key: 'Affectations' });

          await perencoXlsx(updateDataWithoutUser, ECO_DRIVING, `${pathFile}-${titleDate}.xlsx`, column);

        } else {
          console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${ECO_DRIVING}`);
        }
      })
       .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_ACTIVITE_FLOTTE_PERENCO, PERENCO, firstHourDay, lastHourDay, DETAIL_TRAJET)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);
              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    Début: item['Début'],
                    'Lieu de Départ': item['Lieu de Départ'],
                    Fin: item.Fin,
                    "Lieu d'arrivée": item["Lieu d'arrivée"],
                    Durée: item['Durée'],
                    'En mouvement': item['En mouvement'],
                    'Ralenti moteur': item['Ralenti moteur'],
                    Distance: item.Distance,
                    'Temps total': item['Temps total'],
                    Arrêts: item['Arrêts'],
                    'Vitesse maxi': item['Vitesse maxi'],
                  }
                }
              });

              const addWeekend = await addWeekendStatus(rangeData);

              const updateDataWithoutUser = utilisateurNullDetailTrajet(addWeekend)
              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              updateDataWithoutUser.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'trajet' }
                  synthese.push(newItem)
                }
              });

              await perencoXlsx(updateDataWithoutUser, DETAIL_TRAJET, `${pathFile}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${DETAIL_TRAJET}`);
            }
          })
          .catch(err => console.log(err))
      }) 
     .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_ACTIVITE_FLOTTE_PERENCO, PERENCO, firstHourDay, lastHourDay, CONDUITE_DE_NUIT)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);

              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Début': item['Début'],
                    'Lieu de Départ': item['Lieu de Départ'],
                    Fin: item.Fin,
                    "Lieu d'arrivée": item["Lieu d'arrivée"],
                    'Durée': item['Durée'],
                    'En mouvement': item['En mouvement'],
                    'Ralenti moteur': item['Ralenti moteur'],
                    Distance: item.Distance,
                    'Vitesse maxi': item['Vitesse maxi'],
                  }
                }
              });

              const updateDataWithoutUser = utilisateurNullConduiteDeNuit(rangeData);

              const createIntervallesCol = addIntervalles(updateDataWithoutUser);

              createIntervallesCol.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'conduiteNuit' }
                  synthese.push(newItem);
                }

              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              column.splice(3, 0, { key: 'Intervalles' });

              await perencoXlsx(createIntervallesCol, CONDUITE_DE_NUIT, `${pathFile}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${CONDUITE_DE_NUIT}`);
            }
          }).catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_LEGERE_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);

              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée'],
                  }
                }
              });


              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_LEGERE_VILLE);

              const newArrData = addCriticiteProps(arrDataWithZone);

              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'villeLegere' }
                  synthese.push(newItem);
                }

              });


              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });

              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);
              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFileExcesVitesse}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_LEGERE_VILLE}`);
            }
          }).catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_SEVERE_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);

              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée'],
                  }
                }
              });


              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_SEVERE_VILLE);

              const newArrData = addCriticiteProps(arrDataWithZone);

              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'villeSevere' }
                  synthese.push(newItem);
                }
              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });

              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);
              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFileExcesVitesse}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_SEVERE_VILLE}`);
            }
          }).catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_LEGERE_HORS_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);

              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et Heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée']
                  }
                }
              });

              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);


              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_LEGERE_HORS_VILLE);

              const newArrData = addCriticiteProps(arrDataWithZone);



              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'horsVilleLegere' }
                  synthese.push(newItem);
                }

              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });

              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);
              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFileExcesVitesse}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_LEGERE_HORS_VILLE}`);
            }
          }).catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_SEVERE_HORS_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);
              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et Heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée']
                  }
                }
              });

              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_SEVERE_HORS_VILLE);

              const newArrData = addCriticiteProps(arrDataWithZone);

              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'horsVilleSevere' }
                  synthese.push(newItem);
                }
              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });

              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);
              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFileExcesVitesse}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_SEVERE_HORS_VILLE}`);
            }
          }).catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_LEGERE_NAT3_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);
              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et Heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée']
                  }
                }
              });

              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);


              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_LEGERE_NAT3_VILLE);

              const newArrData = addCriticiteProps(arrDataWithZone);

              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'legereNat3' }
                  synthese.push(newItem);
                }

              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });

              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);
              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFileExcesVitesse}-${titleDate}.xlsx`, column);
            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_LEGERE_NAT3_VILLE}`);
            }
          }).catch(err => console.log(err))
      })
      .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_EXCES_DE_VITESSE_FLOTTE, PERENCO, firstHourDay, lastHourDay, EXCES_DE_VITESSE_SEVERE_NAT3_VILLE)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);
              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    'Date et heure': item['Date et heure'],
                    Lieu: item.Lieu,
                    'Vitesse maxi': item['Vitesse maxi'],
                    'Durée': item['Durée']
                  }
                }
              });

              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

              const arrDataWithZone = zoneExcesDeVitesse(updateDataWithoutUser, EXCES_DE_VITESSE_SEVERE_NAT3_VILLE);

              const newArrData = addCriticiteProps(arrDataWithZone);

              newArrData.map(item => {
                if (item) {
                  const newItem = { ...item, template: 'severeNat3' }
                  synthese.push(newItem);
                }
              });

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              column.splice(3, 0, { key: "Zone d'exces de vitesse" });

              //add affectation header at the 1 index
              column.splice(4, 0, { key: "Criticité" });

              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFile}-${titleDate}.xlsx`, column);
              await perencoXlsx(newArrData, SPEEDING_DETAIL, `${pathFileExcesVitesse}-${titleDate}.xlsx`, column);

            } else {
              console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_SEVERE_NAT3_VILLE}`);
            }
          }).catch(err => console.log(err))
      })  
     .then(async () => {
        await getRepportData(ADMIN_PERENCO, RAPPORT_TRAVERSE_ZONE_BONABERI, PERENCO, firstHourDay, lastHourDay, ZONES)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);
              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Regroupement: item.Grouping,
                    Affectations: item.Affectations,
                    Utilisateurs: item.Conducteur,
                    Zone:item.Zone,
                    'Heure Entrée': item['Heure Entrée'],
                    'Heure Sortie': item['Heure Sortie'],
                    'Temps Passé dans la Zone': item['Temps Passé dans la Zone'],
                    'Nombre de visite': item['Nombre de visite'],
                    'Vitesse maxi': item['Vitesse maxi'],
                  }
                }
              }); 

              const filterCol = column.filter(item=>(item.key!=='Grouping' && item.key!=='Conducteur'))

              const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);
            
            
              //add affectation header at the 1 index
              filterCol.splice(0, 0, { key: 'Regroupement' });

              //add affectation header at the 1 index
              filterCol.splice(1, 0, { key: 'Affectations' });

              //add affectation header at the 1 index
              filterCol.splice(2, 0, { key: 'Utilisateurs'});

              await perencoXlsx(updateDataWithoutUser, ZONES, `${pathFileHorsZoneBonaberi}-${titleDate}.xlsx`, filterCol);  

            } else {
              console.log(`no data found in ${RAPPORT_TRAVERSE_ZONE_BONABERI} ${ZONES}`);
            }
          }).catch(err => console.log(err))
      })  
      .then(async () => {
        await getRepportDataUnit(ADMIN_PERENCO, RAPPORT_ACTIVITE_FLOTTE_PERENCO, PERENCO, firstHourDay, lastHourDay, DETAIL_TRAJET)
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;
              const dataWithAffectationColumn = addAffectationsColumn(data);
              const rangeData = dataWithAffectationColumn.map(item => {
                if (item) {
                  return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    Début: item['Début'],
                    'Lieu de Départ': item['Lieu de Départ'],
                    Fin: item.Fin,
                    "Lieu d'arrivée": item["Lieu d'arrivée"],
                    Durée: item['Durée'],
                    'En mouvement': item['En mouvement'],
                    'Ralenti moteur': item['Ralenti moteur'],
                    Distance: item.Distance,
                    'Vitesse maxi': item['Vitesse maxi'],
                  }
                }
              })

              

              const updateDataWithoutUser = utilisateurNullDetailTrajet(rangeData)
              

              const newArrData = addCriticiteAndVitesseLimiteProps(updateDataWithoutUser);

              

              //add affectation header at the 1 index
              column.splice(1, 0, { key: 'Affectations' });

              column.push({key:"Vitesse limite"});
              column.push({key:"Criticité"});

              const filterCol = column.filter(item=>(item.key!=="Temps total" && item.key!=="Arrêts"));
              
              await perencoXlsx(newArrData, TRACKING_TRACAFIC, `${pathTracking}-${titleDate}.xlsx`, filterCol);
            } else {
              console.log(`no data found in ${TRACKING_TRACAFIC} ${TRACKING_TRACAFIC}`);
            }
          })
          .catch(err => console.log(err))
      }) 
      .then(async () => {

          //Group notifications By VehicleID
          const groupItemByVehicleGroup = _.groupBy(synthese, synth => synth['Grouping']);

          //change objects to arr and remove key 
          const arrData = Object.keys(groupItemByVehicleGroup).map((key) => {
            return Object.values(groupItemByVehicleGroup[[key]]);
          });


          const groupArrByTemplate = arrData.map(item => {
            const group = _.groupBy(item, it => it['template']);
            return group
          })

          //change objects to arr and remove key 
          const arrGroup = Object.keys(groupArrByTemplate).map((key) => {
            return Object.values(groupArrByTemplate[[key]]);
          });


          const syntheseServices = arrGroup.map(item => {
            return item.map(it => {
              if (it[0]['template'] === 'exception') {
                const severalHarshAcceleration = it.filter(item => item["Infraction"] === "Several Harsh Acceleration").length;
                const harshAcceleration = it.filter(item => item["Infraction"] === "Harsh Acceleration").length;
                const harshTurn = it.filter(item => item["Infraction"] === "Harsh Turn").length;
                const severalHarshTurn = it.filter(item => item["Infraction"] === "Several Harsh Turn").length;
                const severalHarshBrake = it.filter(item => item["Infraction"] === "Several Harsh Brake").length;
                const harshBrake = it.filter(item => item["Infraction"] === "Harsh brake").length
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Several Harsh Acceleration": severalHarshAcceleration || 0,
                  "Harsh Acceleration": harshAcceleration || 0,
                  "Harsh Turn": harshTurn || 0,
                  "Several Harsh Turn": severalHarshTurn || 0,
                  "Several Harsh Brake": severalHarshBrake || 0,
                  "Harsh Brake": harshBrake || 0
                }
              }
              if (it[0]['template'] === 'trajet') {
                const totalTime = calculateTime(it);
                const totalDistance = it.reduce((acc, item) => acc + parseFloat(item['Distance']), 0).toFixed(2);
                const itemWithWeekendStatus = it.filter(item => item.weekend === true);
                const totalTimeWeekends = calculateTime(itemWithWeekendStatus);
                const totalDistanceWeekends = itemWithWeekendStatus.reduce((acc, item) => acc + parseFloat(item['Distance']), 0).toFixed(2)
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  Distance: totalDistance || 0,
                  Duration: totalTime || 0,
                  Distances: totalDistanceWeekends || 0,
                  Durations: totalTimeWeekends || 0
                }
              }

              if (it[0]['template'] === 'conduiteNuit') {
                const el = it[0];
                const conduiteNuit1 = it.filter(item => item.Intervalles === "22H-24H").length;
                const conduiteNuit2 = it.filter(item => item.Intervalles === "24H-04H").length;
                return {
                  "Grouping": el.Grouping,
                  "Affectations": el.Affectations,
                  "Conducteur": el.Conducteur,
                  "22H24H": conduiteNuit1,
                  "24H04H": conduiteNuit2
                }
              }

              if (it[0]['template'] === 'villeLegere') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Legere-Ville": it.length || 0
                }
              }

              if (it[0]['template'] === 'villeSevere') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Severe-Ville": it.length || 0
                }
              }

              if (it[0]['template'] === 'horsVilleSevere') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Severe-HorsVille": it.length || 0
                }
              }

              if (it[0]['template'] === 'horsVilleLegere') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Legere-HorsVille": it.length || 0
                }
              }


              if (it[0]['template'] === 'severeNat3') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Severe-Nat3": it.length || 0
                }
              }

              if (it[0]['template'] === 'legereNat3') {
                return {
                  "Grouping": it[0]["Grouping"],
                  "Affectations": it[0]["Affectations"],
                  "Conducteur": it[0]["Conducteur"],
                  "Legere-Nat3": it.length || 0
                }
              }

            })
          })

          //Merge objects Arr
          const mergObjects = syntheseServices.map(item => {
            return item.reduce(((r, c) => Object.assign(r, c)), {})
          })


          //Range service 
          const finalService = mergObjects.map(item => {
            return {
              "Imatriculations": item["Grouping"],
              "Affectations": item["Affectations"],
              "Utilisateurs": item["Conducteur"],
              "Distance": item["Distance"] || 0,
              "Duration": item["Duration"] || 0,
              "Harsh Acceleration": item["Harsh Acceleration"] || 0,
              "Several Acceleration": item["Several Harsh Acceleration"] || 0,
              "Harsh Turn": item["Harsh Turn"] || 0,
              "Several Turn": item["Several Harsh Turn"] || 0,
              "Harsh Brake": item["Harsh Brake"] || 0,
              "Several Brake": item["Several Harsh Brake"] || 0,
              "22H24H": item["22H24H"] || 0,
              "24H04H": item["24H04H"] || 0,
              "Distances": item["Distances"] || 0,
              "Durations": item["Durations"] || `00:00:00`,
              "Severe-Ville": item["Severe-Ville"] || 0,
              "Legere-Ville": item["Legere-Ville"] || 0,
              "Severe-HorsVille": item["Severe-HorsVille"] || 0,
              "Legere-HorsVille": item["Legere-HorsVille"] || 0,
              "Severe-Nat3": item["Severe-Nat3"] || 0,
              "Legere-Nat3": item["Legere-Nat3"] || 0,
            }
          })
          await generateSyntheseSheetPerenco(`${pathFile}-${titleDate}.xlsx`, finalService, SYNTHESE);
        }
      )
      .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(sender, receivers, pass, RAPPORT_ACTIVITE_FLOTTE_PERENCO, `${ACTIVITY_REPORT_SUBJECT_MAIL_PERENCO_WEEK}`, `${RAPPORT_ACTIVITE_FLOTTE_PERENCO}.xlsx`, path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
            deleteFile(path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`))
          }, 30000)
        }
      })
      .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(sender, receivers, pass, RAPPORT_TRAVERSE_ZONE_BONABERI, `${ACTIVITY_REPORT_SUBJECT_MAIL_PERENCO_TRAVERSER}`, `${RAPPORT_TRAVERSE_ZONE_BONABERI}.xlsx`, path.join(__dirname, `../../${pathFileHorsZoneBonaberi}-${titleDate}.xlsx`));
            deleteFile(path.join(__dirname, `../../${pathFileHorsZoneBonaberi}-${titleDate}.xlsx`))
          }, 30000)
        }
      })
      .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(sender, receivers, pass, RAPPORT_EXCES_DE_VITESSE_FLOTTE, `${ACTIVITY_REPORT_SUBJECT_MAIL_PERENCO_EXCES_VITESSE}`, `${RAPPORT_EXCES_DE_VITESSE_FLOTTE}.xlsx`, path.join(__dirname, `../../${pathFileExcesVitesse}-${titleDate}.xlsx`));
            deleteFile(path.join(__dirname, `../../${pathFileExcesVitesse}-${titleDate}.xlsx`))
          }, 30000)
        }
      })
      .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(sender, receivers, pass,TRACKING_TRACAFIC, `${ACTIVITY_REPORT_SUBJECT_MAIL_PERENCO_TRACKING}`, `${TRACKING_TRACAFIC}.xlsx`, path.join(__dirname, `../../${pathTracking}-${titleDate}.xlsx`));
            deleteFile(path.join(__dirname, `../../${pathTracking}-${titleDate}.xlsx`))
          }, 30000)
        }
      }) 
      .catch(err => console.log(err)) 

  } catch (err) {
    console.error(err)
  }

}


async function generateAllRepportPerenco(){
  //generateHebdoRepportPerenco();
  //await generateDaylyRepportPerenco();
  cron.schedule('30 04 * * *', async () => {
    await generateDaylyRepportPerenco();
  }, {
    scheduled: true,
    timezone: "Africa/Lagos"
  });

  cron.schedule('30 04 * * Monday', async () => {
    await generateHebdoRepportPerenco();
  }, {
    scheduled: true,
    timezone: "Africa/Lagos"
  });
} 


module.exports ={generateAllRepportPerenco}