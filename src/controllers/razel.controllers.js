const path = require('path');
const cron = require('node-cron');
const _ = require('lodash');

const { getRepportData, getRepportDataUnit } = require('../models/models');
const { replaceProps } = require('../utils/replaceProperties');
const {
  getFistAndLastHourDay,
  getFirstAndLastSevendays,
} = require('../utils/getFirstAndLastHourDay');

const {
  razelXlsx,
  razelExesVitesseXlsx,
  razelSynthese,
} = require('../utils/genrateXlsx');
const { Receivers } = require('../storage/mailReceivers.storage');
const { Senders } = require('../storage/mailSender.storage');
const { sendMail } = require('../utils/sendMail');
const { deleteFile } = require('../utils/deleteFile');
const {
  calculateTimeGlobal,
  divideTimesAsPercentage,
} = require('../utils/sommeArrTimes');
const { RAZEL_PL, RAZEL_VL } = require('../constants/clients');
const { ADMIN_RAZEL } = require('../constants/ressourcesClient');
const {
  ACTIVITY_REPORT_SUBJECT_MAIL_RAZEL_PL_WEEK,
  ACTIVITY_REPORT_SUBJECT_MAIL_RAZEL_PL_DAY,
  ACTIVITY_REPORT_SUBJECT_MAIL_RAZEL_VL_DAY,
  ACTIVITY_REPORT_SUBJECT_MAIL_RAZEL_VL_WEEK,
} = require('../constants/mailSubjects');

const {
  CONDUITE_DE_NUIT_RAZEL,
  CONDUITE_DE_WEEKEND_RAZEL,
  DETAIL_TRAJET_FLOTTE_RAZEL,
  ECO_DRIVING_RAZEL,
  RAPPORT_EXCES_DE_VITESSE_AG_RAZEL,
  RAPPORT_EXCES_DE_VITESSE_HAG_RAZEL,
  RAPPORT_RALENTI_MOTEUR_RAZEL,
  RAPPORT_SYNTHESE_ACTIVITE_RAZEL,
  RAPPORT_HEBDOMADAIRE_VL_RAZEL,
  RAPPORT_JOURNALIER_VL_RAZEL,
  RAPPORT_HEBDOMADAIRE_TRUCKS_RAZEL,
  RAPPORT_JOURNALIER_TRUCKS_RAZEL,
} = require('../constants/template');

const pass = process.env.PASS_MAIL_SAV;

const {
  CONDUITE_DE_NUIT_RAZEL_GROUP,
  CONDUITE_DE_WEEKEND_RAZEL_GROUP,
  ECO_DRIVING_RAZEL_GROUP,
  EXCES_DE_VITESSE_AG_PL_GROUP,
  EXCES_DE_VITESSE_AG_VL_GROUP,
  RALENTI_MOTEUR_RAZEL_GROUP,
  RAPPORT_SYNTHESE_ACTIVITE_RAZEL_GROUP,
  EXCES_DE_VITESSE_HA_VL_GROUP,
  EXCES_DE_VITESSE_HA_PL_GROUP,
  DETAIL_TRAJET_FLOTTE_GROUP,
} = require('../constants/subGroups');

const { json } = require('body-parser');

const RAZEL = 'RAZEL';

//dayly report Razel

async function generateDaylyRepportRazelVL() {
  try {
    const synthese = [];
    const conduiteDeNuit = [];
    const ralentiMoteur = [];
    const detailTrajet = [];
    const conduitWeekend = [];
    const sender = await Senders(RAZEL, 'E');
    const receivers = await Receivers(RAZEL, 'D');
    /*   const sender = 'rapport.sav@camtrack.net';
    const receivers = [
      'franky.shity@camtrack.net',
      'j.belloy@razel-bec.fayat.com',
      'lrichard@razel.fr',
      'ageorge@razel.fr',
      'wketchankeu@razel.fr',
      'wmbassi@razel.fr',
      'Andjele@razel.fr',
      'joel.youassi@camtrack.net',
      'sav@camtrack.net',
    ]; */
    const fistAndLastHourDay = getFistAndLastHourDay();

    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;
    const titleDate = fistAndLastHourDay.dateTitle;

    /*const firstHourDay = '1734130800';
    const lastHourDay = '1734217199';
    const titleDate = fistAndLastHourDay.dateTitle; */
    const pathFile = 'rapport/razel/RAPPORT-ACTIVITE-FLOTTE-RAZEL-VL';

    // Ralenti moteur distinct synthese to detail
    let columnRalentiMoteur;
    await getRepportDataUnit(
      ADMIN_RAZEL,
      RAPPORT_RALENTI_MOTEUR_RAZEL,
      RAZEL_VL,
      firstHourDay,
      lastHourDay,
      RALENTI_MOTEUR_RAZEL_GROUP
    )
      .then(async (res) => {
        const objLenth = res?.obj.length;
        if (objLenth > 0) {
          const data = res.obj;

          const addMarkerToUnit = data.map((item) => ({
            ...item,
            Véhicules: `${item['Grouping'] + '-unit'}`,
          }));
          addMarkerToUnit.map((item) => ralentiMoteur.push(item));
        } else {
          console.log(
            `no data found in data unit ${RAPPORT_RALENTI_MOTEUR_RAZEL} ${RALENTI_MOTEUR_RAZEL_GROUP}`
          );
        }
      })
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_RALENTI_MOTEUR_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          RALENTI_MOTEUR_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            columnRalentiMoteur = res.excelColum;
            columnRalentiMoteur[0] = { key: 'Véhicules' };
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );
            replaceGroupinByVehicle.map((item) => ralentiMoteur.push(item));

            //push all data in synthese Arr
            data.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'ralenti-moteur' };
                synthese.push(newItem);
              }
            });
          } else {
            console.log(
              `no data found in ${RAPPORT_RALENTI_MOTEUR_RAZEL} ${RALENTI_MOTEUR_RAZEL_GROUP}`
            );
          }
        });
      })
      .then(async () => {
        const sortData = ralentiMoteur.sort((a, b) => {
          const nameA = a['Véhicules'].toUpperCase();
          const nameB = b['Véhicules'].toUpperCase();
          if (nameA > nameB) {
            return -1;
          }
          if (nameA < nameB) {
            return 1;
          }
          return 0;
        });

        await razelXlsx(
          sortData,
          RALENTI_MOTEUR_RAZEL_GROUP,
          `${pathFile}-${titleDate}.xlsx`,
          columnRalentiMoteur,
          `${RAPPORT_RALENTI_MOTEUR_RAZEL} ${titleDate}`
        );
      })

      //conduite de weekend disting unit to detail
      /*  .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          CONDUITE_DE_WEEKEND_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          CONDUITE_DE_WEEKEND_RAZEL_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => conduitWeekend.push(item));
            } else {
              console.log(
                `no data found in data unit ${CONDUITE_DE_WEEKEND_RAZEL} ${CONDUITE_DE_WEEKEND_RAZEL_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              CONDUITE_DE_WEEKEND_RAZEL,
              RAZEL_VL,
              firstHourDay,
              lastHourDay,
              CONDUITE_DE_WEEKEND_RAZEL_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) =>
                  conduitWeekend.push(item)
                );

                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'conduite-weekend' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${CONDUITE_DE_WEEKEND_RAZEL} ${CONDUITE_DE_WEEKEND_RAZEL_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = conduitWeekend.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              CONDUITE_DE_WEEKEND_RAZEL,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${CONDUITE_DE_WEEKEND_RAZEL_GROUP} ${titleDate}`
            );
          });
      })
 */
      //conduite de nuit disting unit to detail
      /*  .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          CONDUITE_DE_NUIT_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          CONDUITE_DE_NUIT_RAZEL_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => conduiteDeNuit.push(item));
            } else {
              console.log(
                `no data found in data unit ${CONDUITE_DE_NUIT_RAZEL} ${CONDUITE_DE_NUIT_RAZEL_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              CONDUITE_DE_NUIT_RAZEL,
              RAZEL_VL,
              firstHourDay,
              lastHourDay,
              CONDUITE_DE_NUIT_RAZEL_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) =>
                  conduiteDeNuit.push(item)
                );

                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'conduite-nuit' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${CONDUITE_DE_NUIT_RAZEL} ${CONDUITE_DE_NUIT_RAZEL_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = conduiteDeNuit.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              CONDUITE_DE_NUIT_RAZEL_GROUP,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${CONDUITE_DE_NUIT_RAZEL} ${titleDate}`
            );
          });
      }) */

      //Eco driving

      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          ECO_DRIVING_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          ECO_DRIVING_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            let column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            //push all data in synthese Arr
            data.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'eco-driving' };
                synthese.push(newItem);
              }
            });

            await razelXlsx(
              replaceGroupinByVehicle,
              ECO_DRIVING_RAZEL_GROUP,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${ECO_DRIVING_RAZEL_GROUP} ${titleDate}`
            );
          } else {
            console.log(
              `no data found in ${ECO_DRIVING_RAZEL_GROUP} ${ECO_DRIVING_RAZEL_GROUP}`
            );
          }
        });
      })

      //Detail trajet
      /*  .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          DETAIL_TRAJET_FLOTTE_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          DETAIL_TRAJET_FLOTTE_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => detailTrajet.push(item));
            } else {
              console.log(
                `no data found in data unit ${DETAIL_TRAJET_FLOTTE_RAZEL} ${DETAIL_TRAJET_FLOTTE_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              DETAIL_TRAJET_FLOTTE_RAZEL,
              RAZEL_VL,
              firstHourDay,
              lastHourDay,
              DETAIL_TRAJET_FLOTTE_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) => detailTrajet.push(item));

                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'detail-trajet' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${DETAIL_TRAJET_FLOTTE_RAZEL} ${DETAIL_TRAJET_FLOTTE_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = detailTrajet.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              DETAIL_TRAJET_FLOTTE_RAZEL,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${DETAIL_TRAJET_FLOTTE_RAZEL} ${titleDate}`
            );
          });
      })
 */
      //EXCess de vitess VL
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_EXCES_DE_VITESSE_AG_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          EXCES_DE_VITESSE_AG_VL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            let column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            column.push({ key: 'Vitesse Limite' });
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const addVitesseLimite = replaceGroupinByVehicle.map((item) => {
              return { ...item, 'Vitesse Limite': '60km/H' };
            });

            const removeDuplicateItem = _.uniqBy(
              addVitesseLimite,
              function (e) {
                return e['Durée'];
              }
            );

            //push all data in synthese Arr
            removeDuplicateItem.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'excess-vitesse-vl-AG' };
                synthese.push(newItem);
              }
            });
            await razelExesVitesseXlsx(
              removeDuplicateItem,
              'Exces de vitesse razel VL',
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `Exces de vitesse VL ${titleDate}`,
              'AGGLOMERATION (60km/H)'
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_EXCES_DE_VITESSE_AG_RAZEL} ${EXCES_DE_VITESSE_AG_VL_GROUP}`
            );
          }
        });
      })
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_EXCES_DE_VITESSE_HAG_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          EXCES_DE_VITESSE_HA_VL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            column.push({ key: 'Vitesse Limite' });
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const addVitesseLimite = replaceGroupinByVehicle.map((item) => {
              return { ...item, 'Vitesse Limite': '90km/H' };
            });

            const removeDuplicateItem = _.uniqBy(
              addVitesseLimite,
              function (e) {
                return e['Durée'];
              }
            );

            //push all data in synthese Arr
            removeDuplicateItem.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'excess-vitesse-vl-HAG' };

                synthese.push(newItem);
              }
            });

            await razelExesVitesseXlsx(
              removeDuplicateItem,
              'Exces de vitesse razel VL',
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `Exces de vitesse VL ${titleDate}`,
              'HORS AGGLOMERATION (90km/H)'
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_EXCES_DE_VITESSE_HAG_RAZEL} ${EXCES_DE_VITESSE_HA_VL_GROUP}`
            );
          }
        });
      })

      //Razel VL synthese
      /*  .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_SYNTHESE_ACTIVITE_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          RAPPORT_SYNTHESE_ACTIVITE_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const formatArr = replaceGroupinByVehicle.map((item) => {
              return {
                Véhicules: item['Véhicules'],
                'Heure moteur': item['HEURE MOTEUR'],
                'Ralenti moteur': item['RALENTI MOTEUR'],
                'En mouvement': item['EN MOUVEMENT'],
                Kilométrage: item.KILOMETRAGE,
              };
            });

            //push all data in synthese Arr

            formatArr.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'synthese-vl' };
                synthese.push(newItem);
              }
            });

            //Group  By VehicleID
            const groupItemByVehicleGroup = _.groupBy(
              synthese,
              (synth) => synth['Véhicules']
            );

            //change objects to arr and remove key
            const arrData = Object.keys(groupItemByVehicleGroup).map((key) => {
              return Object.values(groupItemByVehicleGroup[[key]]);
            });

            const groupArrByTemplate = arrData.map((item) => {
              const group = _.groupBy(item, (it) => it['template']);
              return group;
            });

            //change objects to arr and remove key
            const arrGroup = Object.keys(groupArrByTemplate).map((key) => {
              return Object.values(groupArrByTemplate[[key]]);
            });

            const syntheseServices = arrGroup.map((item) => {
              return item.map((it) => {
                //count number of excess vitesse  aglommeration
                if (it[0]['template'] === 'excess-vitesse-vl-AG') {
                  const nbreAGVL = it.length;
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre d'exces de vitesse Agglomeration": nbreAGVL,
                  };
                }

                //count number of excess vitesse Hors aglommeration
                if (it[0]['template'] === 'excess-vitesse-vl-HAG') {
                  const nbreHAGVL = it.length;
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre d'exces de vitesse Hors Agglomeration": nbreHAGVL,
                  };
                }
                //count nbers of freinage,acceleration brusque,virage
                if (it[0]['template'] === 'eco-driving') {
                  const freinage = it.filter(
                    (item) => item.INFRACTION === 'Freinage Brusque'
                  ).length;
                  const accelerationExcess = it.filter(
                    (item) => item.INFRACTION === 'Accélération Excessif'
                  ).length;
                  const virage = it.filter(
                    (item) => item.INFRACTION === 'Harsh Corning'
                  ).length;

                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Acceleration excessives': accelerationExcess,
                    'Freinage Brusque': freinage,
                    Virage: virage,
                  };
                }

                //count numbr of ralenti moteur and extract total duree
                if (it[0]['template'] === 'ralenti-moteur') {
                  const nbreArret = it.length;
                  const totalDuree = calculateTimeGlobal(
                    it,
                    'DUREE ARRËT MOTEUR EN MARCHE'
                  );
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre D'arret": nbreArret,
                    "Duree d'arret": totalDuree,
                  };
                }

                //calculate numbr of duree de nuit  and extract km
                if (it[0]['template'] === 'conduite-nuit') {
                  const dureeNuit = calculateTimeGlobal(
                    it,
                    'Durée de conduite'
                  );
                  const kmNuit = it
                    .reduce(
                      (acc, item) => acc + parseFloat(item['Kilométrage']),
                      0
                    )
                    .toFixed(2);
                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Duree Conduite nuit': dureeNuit,
                    'Kilometrage nuit': kmNuit,
                  };
                }

                //calculate numbr of duree de weekend  and extract km
                if (it[0]['template'] === 'conduite-weekend') {
                  const dureeConduiteWeekend = calculateTimeGlobal(
                    it,
                    'Durée de conduite'
                  );
                  const kmNuit = it
                    .reduce(
                      (acc, item) => acc + parseFloat(item['Kilométrage']),
                      0
                    )
                    .toFixed(2);

                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Duree Conduite weekend': dureeConduiteWeekend,
                    'Kilometrage weekend': kmNuit,
                  };
                }

                if (it[0]['template'] === 'synthese-vl') {
                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Heure moteur': it[0]['Heure moteur'],
                    'Ralenti moteur': it[0]['Ralenti moteur'],
                    'En mouvements': it[0]['En mouvement'],
                    Kilométrage: it[0].Kilométrage,
                  };
                }
              });
            });

            //Merge objects Arr
            const mergObjects = syntheseServices.map((item) => {
              return item.reduce((r, c) => Object.assign(r, c), {});
            });

            //Range service
            const finalService = mergObjects.map((item) => {
              const rMoteur = item['Ralenti moteur'] || '00:00:00';
              const mvtM = item['En mouvements'] || '00:00:00';
              const hMoteur = item['Heure moteur'] || '00:00:00';

              const ralentiMoteurProd = divideTimesAsPercentage(
                rMoteur.toString(),
                hMoteur.toString()
              );
              const mvtProd = divideTimesAsPercentage(
                mvtM.toString(),
                hMoteur.toString()
              );
              return {
                Véhicules: item['Véhicules'],
                'Heure moteur (heure)': item['Heure moteur'] || '00:00:00',
                'Ralenti moteur (heure)': item['Ralenti moteur'] || '00:00:00',
                'En Mouvement (heure)': item['En mouvements'] || '00:00:00',
                'Kilométrage (km)': item['Kilométrage'] || 0,
                "Nbre d'exces de vitesse Agglomeration":
                  item["Nbre d'exces de vitesse Agglomeration"] || 0,
                "Nbre d'exces de vitesse Hors Agglomeration":
                  item["Nbre d'exces de vitesse Hors Agglomeration"] || 0,
                'Acceleration excessives': item['Acceleration excessives'] || 0,
                'Freinage Brusque': item['Freinage Brusque'] || 0,
                Virage: item.Virage || 0,
                "Nbre D'arret": item["Nbre D'arret"] || 0,
                "Duree d'arret (heure)": item["Duree d'arret"] || 0,
                'Duree Conduite weekend (heure)':
                  item['Duree Conduite weekend'] || '00:00:00',
                'Kilometrage weekend (km)': item['Kilometrage weekend'] || 0,
                'Duree Conduite nuit (heure)':
                  item['Duree Conduite nuit'] || '00:00:00',
                'Kilometrage nuit (km)': item['Kilometrage nuit'] || 0,
                'Ralenti Moteur (%)': ralentiMoteurProd.toFixed(2) + '%' || 0,
                'En mouvement (%)': mvtProd.toFixed(2) + '%' || 0,
              };
            });

            await razelSynthese(
              `${pathFile}-${titleDate}.xlsx`,
              finalService,
              'Synthese',
              `Rapport Synthèse activité : RAZEL VL,${titleDate}`
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_SYNTHESE_ACTIVITE_RAZEL} ${RAPPORT_SYNTHESE_ACTIVITE_RAZEL_GROUP}`
            );
          }
        });
      })*/

      //send mail
      .then(() => {
        if (sender && receivers) {
          console.log(sender);
          console.log(receivers);
          setTimeout(() => {
            sendMail(
              sender,
              receivers,
              pass,
              RAPPORT_JOURNALIER_VL_RAZEL,
              `${ACTIVITY_REPORT_SUBJECT_MAIL_RAZEL_VL_DAY}`,
              `${RAPPORT_JOURNALIER_VL_RAZEL}.xlsx`,
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
            deleteFile(
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
          }, 180000);
        }
      })

      .catch((err) => console.log(err));
  } catch (err) {
    console.error(err);
  }
}

//Weekly report razel
async function generateWeeklyRepportRazelVL() {
  try {
    const synthese = [];
    const conduiteDeNuit = [];
    const ralentiMoteur = [];
    const detailTrajet = [];
    const conduitWeekend = [];
    const sender = await Senders(RAZEL, 'E');
    const receivers = await Receivers(RAZEL, 'D');

    /*    const sender = 'rapport.sav@camtrack.net';
    const receivers = [
      'franky.shity@camtrack.net',
      '	j.belloy@razel-bec.fayat.com',
      'lrichard@razel.fr',
      'ageorge@razel.fr',
      'wketchankeu@razel.fr',
      'wmbassi@razel.fr',
      'Andjele@razel.fr',
      'joel.youassi@camtrack.net',
      'sav@camtrack.net',
    ]; */
    const fistAndLastHourDay = getFirstAndLastSevendays();

    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;
    const titleDate = fistAndLastHourDay.dateTitle;

    /*     const firstHourDay = '1734130800';
    const lastHourDay = '1734217199';
    const titleDate = fistAndLastHourDay.dateTitle; */
    const pathFile = 'rapport/razel/RAPPORT-ACTIVITE-FLOTTE-RAZEL-VL';

    // Ralenti moteur distinct synthese to detail

    let columnRalentiMoteur;
    await getRepportDataUnit(
      ADMIN_RAZEL,
      RAPPORT_RALENTI_MOTEUR_RAZEL,
      RAZEL_VL,
      firstHourDay,
      lastHourDay,
      RALENTI_MOTEUR_RAZEL_GROUP
    )
      .then(async (res) => {
        const objLenth = res?.obj.length;
        if (objLenth > 0) {
          const data = res.obj;

          const addMarkerToUnit = data.map((item) => ({
            ...item,
            Véhicules: `${item['Grouping'] + '-unit'}`,
          }));
          addMarkerToUnit.map((item) => ralentiMoteur.push(item));
        } else {
          console.log(
            `no data found in data unit ${RAPPORT_RALENTI_MOTEUR_RAZEL} ${RALENTI_MOTEUR_RAZEL_GROUP}`
          );
        }
      })
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_RALENTI_MOTEUR_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          RALENTI_MOTEUR_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            columnRalentiMoteur = res.excelColum;
            columnRalentiMoteur[0] = { key: 'Véhicules' };
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );
            replaceGroupinByVehicle.map((item) => ralentiMoteur.push(item));

            //push all data in synthese Arr
            data.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'ralenti-moteur' };
                synthese.push(newItem);
              }
            });
          } else {
            console.log(
              `no data found in ${RAPPORT_RALENTI_MOTEUR_RAZEL} ${RALENTI_MOTEUR_RAZEL_GROUP}`
            );
          }
        });
      })
      .then(async () => {
        const sortData = ralentiMoteur.sort((a, b) => {
          const nameA = a['Véhicules'].toUpperCase();
          const nameB = b['Véhicules'].toUpperCase();
          if (nameA > nameB) {
            return -1;
          }
          if (nameA < nameB) {
            return 1;
          }
          return 0;
        });

        await razelXlsx(
          sortData,
          RALENTI_MOTEUR_RAZEL_GROUP,
          `${pathFile}-${titleDate}.xlsx`,
          columnRalentiMoteur,
          `${RAPPORT_RALENTI_MOTEUR_RAZEL} ${titleDate}`
        );
      })

      //conduite de weekend disting unit to detail
      .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          CONDUITE_DE_WEEKEND_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          CONDUITE_DE_WEEKEND_RAZEL_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => conduitWeekend.push(item));
            } else {
              console.log(
                `no data found in data unit ${CONDUITE_DE_WEEKEND_RAZEL} ${CONDUITE_DE_WEEKEND_RAZEL_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              CONDUITE_DE_WEEKEND_RAZEL,
              RAZEL_VL,
              firstHourDay,
              lastHourDay,
              CONDUITE_DE_WEEKEND_RAZEL_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) =>
                  conduitWeekend.push(item)
                );

                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'conduite-weekend' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${CONDUITE_DE_WEEKEND_RAZEL} ${CONDUITE_DE_WEEKEND_RAZEL_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = conduitWeekend.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              CONDUITE_DE_WEEKEND_RAZEL,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${CONDUITE_DE_WEEKEND_RAZEL_GROUP} ${titleDate}`
            );
          });
      })

      //conduite de nuit disting unit to detail
      .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          CONDUITE_DE_NUIT_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          CONDUITE_DE_NUIT_RAZEL_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => conduiteDeNuit.push(item));
            } else {
              console.log(
                `no data found in data unit ${CONDUITE_DE_NUIT_RAZEL} ${CONDUITE_DE_NUIT_RAZEL_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              CONDUITE_DE_NUIT_RAZEL,
              RAZEL_VL,
              firstHourDay,
              lastHourDay,
              CONDUITE_DE_NUIT_RAZEL_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) =>
                  conduiteDeNuit.push(item)
                );

                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'conduite-nuit' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${CONDUITE_DE_NUIT_RAZEL} ${CONDUITE_DE_NUIT_RAZEL_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = conduiteDeNuit.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              CONDUITE_DE_NUIT_RAZEL_GROUP,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${CONDUITE_DE_NUIT_RAZEL} ${titleDate}`
            );
          });
      })

      //Eco driving
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          ECO_DRIVING_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          ECO_DRIVING_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            //push all data in synthese Arr
            data.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'eco-driving' };
                synthese.push(newItem);
              }
            });

            await razelXlsx(
              replaceGroupinByVehicle,
              ECO_DRIVING_RAZEL_GROUP,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${ECO_DRIVING_RAZEL_GROUP} ${titleDate}`
            );
          } else {
            console.log(
              `no data found in ${ECO_DRIVING_RAZEL_GROUP} ${ECO_DRIVING_RAZEL_GROUP}`
            );
          }
        });
      })

      //Detail trajet
      .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          DETAIL_TRAJET_FLOTTE_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          DETAIL_TRAJET_FLOTTE_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => detailTrajet.push(item));
            } else {
              console.log(
                `no data found in data unit ${DETAIL_TRAJET_FLOTTE_RAZEL} ${DETAIL_TRAJET_FLOTTE_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              DETAIL_TRAJET_FLOTTE_RAZEL,
              RAZEL_VL,
              firstHourDay,
              lastHourDay,
              DETAIL_TRAJET_FLOTTE_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) => detailTrajet.push(item));

                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'detail-trajet' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${DETAIL_TRAJET_FLOTTE_RAZEL} ${DETAIL_TRAJET_FLOTTE_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = detailTrajet.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              DETAIL_TRAJET_FLOTTE_RAZEL,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${DETAIL_TRAJET_FLOTTE_RAZEL} ${titleDate}`
            );
          });
      })

      //EXCess de vitess VL
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_EXCES_DE_VITESSE_AG_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          EXCES_DE_VITESSE_AG_VL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            column.push({ key: 'Vitesse Limite' });
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const addVitesseLimite = replaceGroupinByVehicle.map((item) => {
              return { ...item, 'Vitesse Limite': '60km/H' };
            });

            const removeDuplicateItem = _.uniqBy(
              addVitesseLimite,
              function (e) {
                return e['Durée'];
              }
            );

            //push all data in synthese Arr
            removeDuplicateItem.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'excess-vitesse-vl-AG' };
                synthese.push(newItem);
              }
            });
            await razelExesVitesseXlsx(
              removeDuplicateItem,
              'Exces de vitesse razel VL',
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `Exces de vitesse VL ${titleDate}`,
              'AGGLOMERATION (60km/H)'
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_EXCES_DE_VITESSE_AG_RAZEL} ${EXCES_DE_VITESSE_AG_VL_GROUP}`
            );
          }
        });
      })
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_EXCES_DE_VITESSE_HAG_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          EXCES_DE_VITESSE_HA_VL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            column.push({ key: 'Vitesse Limite' });
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const addVitesseLimite = replaceGroupinByVehicle.map((item) => {
              return { ...item, 'Vitesse Limite': '90km/H' };
            });

            const removeDuplicateItem = _.uniqBy(
              addVitesseLimite,
              function (e) {
                return e['Durée'];
              }
            );

            //push all data in synthese Arr
            removeDuplicateItem.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'excess-vitesse-vl-HAG' };

                synthese.push(newItem);
              }
            });

            await razelExesVitesseXlsx(
              removeDuplicateItem,
              'Exces de vitesse razel VL',
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `Exces de vitesse VL ${titleDate}`,
              'HORS AGGLOMERATION (90km/H)'
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_EXCES_DE_VITESSE_HAG_RAZEL} ${EXCES_DE_VITESSE_HA_VL_GROUP}`
            );
          }
        });
      })
      //Razel VL synthese
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_SYNTHESE_ACTIVITE_RAZEL,
          RAZEL_VL,
          firstHourDay,
          lastHourDay,
          RAPPORT_SYNTHESE_ACTIVITE_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const formatArr = replaceGroupinByVehicle.map((item) => {
              return {
                Véhicules: item['Véhicules'],
                'Heure moteur': item['HEURE MOTEUR'],
                'Ralenti moteur': item['RALENTI MOTEUR'],
                'En mouvement': item['EN MOUVEMENT'],
                Kilométrage: item.KILOMETRAGE,
              };
            });

            //push all data in synthese Arr

            formatArr.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'synthese-vl' };
                synthese.push(newItem);
              }
            });

            //Group  By VehicleID
            const groupItemByVehicleGroup = _.groupBy(
              synthese,
              (synth) => synth['Véhicules']
            );

            //change objects to arr and remove key
            const arrData = Object.keys(groupItemByVehicleGroup).map((key) => {
              return Object.values(groupItemByVehicleGroup[[key]]);
            });

            const groupArrByTemplate = arrData.map((item) => {
              const group = _.groupBy(item, (it) => it['template']);
              return group;
            });

            //change objects to arr and remove key
            const arrGroup = Object.keys(groupArrByTemplate).map((key) => {
              return Object.values(groupArrByTemplate[[key]]);
            });

            const syntheseServices = arrGroup.map((item) => {
              return item.map((it) => {
                //count number of excess vitesse  aglommeration
                if (it[0]['template'] === 'excess-vitesse-vl-AG') {
                  const nbreAGVL = it.length;
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre d'exces de vitesse Agglomeration": nbreAGVL,
                  };
                }

                //count number of excess vitesse Hors aglommeration
                if (it[0]['template'] === 'excess-vitesse-vl-HAG') {
                  const nbreHAGVL = it.length;
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre d'exces de vitesse Hors Agglomeration": nbreHAGVL,
                  };
                }
                //count nbers of freinage,acceleration brusque,virage
                if (it[0]['template'] === 'eco-driving') {
                  const freinage = it.filter(
                    (item) => item.INFRACTION === 'Freinage Brusque'
                  ).length;
                  const accelerationExcess = it.filter(
                    (item) => item.INFRACTION === 'Accélération Excessif'
                  ).length;
                  const virage = it.filter(
                    (item) => item.INFRACTION === 'Harsh Corning'
                  ).length;

                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Acceleration excessives': accelerationExcess,
                    'Freinage Brusque': freinage,
                    Virage: virage,
                  };
                }

                //count numbr of ralenti moteur and extract total duree
                if (it[0]['template'] === 'ralenti-moteur') {
                  const nbreArret = it.length;
                  const totalDuree = calculateTimeGlobal(
                    it,
                    'DUREE ARRËT MOTEUR EN MARCHE'
                  );
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre D'arret": nbreArret,
                    "Duree d'arret": totalDuree,
                  };
                }

                //calculate numbr of duree de nuit  and extract km
                if (it[0]['template'] === 'conduite-nuit') {
                  const dureeNuit = calculateTimeGlobal(
                    it,
                    'Durée de conduite'
                  );
                  const kmNuit = it
                    .reduce(
                      (acc, item) => acc + parseFloat(item['Kilométrage']),
                      0
                    )
                    .toFixed(2);
                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Duree Conduite nuit': dureeNuit,
                    'Kilometrage nuit': kmNuit,
                  };
                }

                //calculate numbr of duree de weekend  and extract km
                if (it[0]['template'] === 'conduite-weekend') {
                  const dureeConduiteWeekend = calculateTimeGlobal(
                    it,
                    'Durée de conduite'
                  );
                  const kmNuit = it
                    .reduce(
                      (acc, item) => acc + parseFloat(item['Kilométrage']),
                      0
                    )
                    .toFixed(2);

                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Duree Conduite weekend': dureeConduiteWeekend,
                    'Kilometrage weekend': kmNuit,
                  };
                }

                if (it[0]['template'] === 'synthese-vl') {
                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Heure moteur': it[0]['Heure moteur'],
                    'Ralenti moteur': it[0]['Ralenti moteur'],
                    'En mouvements': it[0]['En mouvement'],
                    Kilométrage: it[0].Kilométrage,
                  };
                }
              });
            });

            //Merge objects Arr
            const mergObjects = syntheseServices.map((item) => {
              return item.reduce((r, c) => Object.assign(r, c), {});
            });

            //Range service
            const finalService = mergObjects.map((item) => {
              const rMoteur = item['Ralenti moteur'] || '00:00:00';
              const mvtM = item['En mouvements'] || '00:00:00';
              const hMoteur = item['Heure moteur'] || '00:00:00';

              const ralentiMoteurProd = divideTimesAsPercentage(
                rMoteur.toString(),
                hMoteur.toString()
              );
              const mvtProd = divideTimesAsPercentage(
                mvtM.toString(),
                hMoteur.toString()
              );
              return {
                Véhicules: item['Véhicules'],
                'Heure moteur (heure)': item['Heure moteur'] || '00:00:00',
                'Ralenti moteur (heure)': item['Ralenti moteur'] || '00:00:00',
                'En Mouvement (heure)': item['En mouvements'] || '00:00:00',
                'Kilométrage (km)': item['Kilométrage'] || 0,
                "Nbre d'exces de vitesse Agglomeration":
                  item["Nbre d'exces de vitesse Agglomeration"] || 0,
                "Nbre d'exces de vitesse Hors Agglomeration":
                  item["Nbre d'exces de vitesse Hors Agglomeration"] || 0,
                'Acceleration excessives': item['Acceleration excessives'] || 0,
                'Freinage Brusque': item['Freinage Brusque'] || 0,
                Virage: item.Virage || 0,
                "Nbre D'arret": item["Nbre D'arret"] || 0,
                "Duree d'arret (heure)": item["Duree d'arret"] || 0,
                'Duree Conduite weekend (heure)':
                  item['Duree Conduite weekend'] || '00:00:00',
                'Kilometrage weekend (km)': item['Kilometrage weekend'] || 0,
                'Duree Conduite nuit (heure)':
                  item['Duree Conduite nuit'] || '00:00:00',
                'Kilometrage nuit (km)': item['Kilometrage nuit'] || 0,
                'Ralenti Moteur (%)': ralentiMoteurProd.toFixed(2) + '%' || 0,
                'En mouvement (%)': mvtProd.toFixed(2) + '%' || 0,
              };
            });

            await razelSynthese(
              `${pathFile}-${titleDate}.xlsx`,
              finalService,
              'Synthese',
              `Rapport Synthèse activité : RAZEL VL,${titleDate}`
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_SYNTHESE_ACTIVITE_RAZEL} ${RAPPORT_SYNTHESE_ACTIVITE_RAZEL_GROUP}`
            );
          }
        });
      })

      //send mail
      .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(
              sender,
              receivers,
              pass,
              RAPPORT_HEBDOMADAIRE_VL_RAZEL,
              `${ACTIVITY_REPORT_SUBJECT_MAIL_RAZEL_VL_WEEK}`,
              `${RAPPORT_HEBDOMADAIRE_VL_RAZEL}.xlsx`,
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
            deleteFile(
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
          }, 180000);
        }
      })

      .catch((err) => console.log(err));
  } catch (err) {
    console.error(err);
  }
}

async function generateDaylyRepportRazelPL() {
  try {
    const synthese = [];
    const conduiteDeNuit = [];
    const ralentiMoteur = [];
    const detailTrajet = [];
    const conduitWeekend = [];
    const sender = await Senders(RAZEL, 'E');
    const receivers = await Receivers(RAZEL, 'D');

    /*     const sender = 'rapport.sav@camtrack.net';
    const receivers = [
      'franky.shity@camtrack.net',
      '	j.belloy@razel-bec.fayat.com',
      'lrichard@razel.fr',
      'ageorge@razel.fr',
      'wketchankeu@razel.fr',
      'wmbassi@razel.fr',
      'Andjele@razel.fr',
      'joel.youassi@camtrack.net',
      'sav@camtrack.net',
    ];
 */
    const fistAndLastHourDay = getFistAndLastHourDay();
    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;
    const titleDate = fistAndLastHourDay.dateTitle;

    /*     const firstHourDay = '1734130800';
    const lastHourDay = '1734217199';
    const titleDate = fistAndLastHourDay.dateTitle; */
    const pathFile = 'rapport/razel/RAPPORT-ACTIVITE-FLOTTE-RAZEL-PL';

    // Ralenti moteur distinct synthese to detail
    let columnRalentiMoteur;
    await getRepportDataUnit(
      ADMIN_RAZEL,
      RAPPORT_RALENTI_MOTEUR_RAZEL,
      RAZEL_PL,
      firstHourDay,
      lastHourDay,
      RALENTI_MOTEUR_RAZEL_GROUP
    )
      .then(async (res) => {
        const objLenth = res?.obj.length;
        if (objLenth > 0) {
          const data = res.obj;

          const addMarkerToUnit = data.map((item) => ({
            ...item,
            Véhicules: `${item['Grouping'] + '-unit'}`,
          }));
          addMarkerToUnit.map((item) => ralentiMoteur.push(item));
        } else {
          console.log(
            `no data found in data unit ${RAPPORT_RALENTI_MOTEUR_RAZEL} ${RALENTI_MOTEUR_RAZEL_GROUP}`
          );
        }
      })
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_RALENTI_MOTEUR_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          RALENTI_MOTEUR_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            columnRalentiMoteur = res.excelColum;
            columnRalentiMoteur[0] = { key: 'Véhicules' };
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );
            replaceGroupinByVehicle.map((item) => ralentiMoteur.push(item));
            //push all data in synthese Arr
            data.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'ralenti-moteur' };
                synthese.push(newItem);
              }
            });
          } else {
            console.log(
              `no data found in ${RAPPORT_RALENTI_MOTEUR_RAZEL} ${RALENTI_MOTEUR_RAZEL_GROUP}`
            );
          }
        });
      })
      .then(async () => {
        const sortData = ralentiMoteur.sort((a, b) => {
          const nameA = a['Véhicules'].toUpperCase();
          const nameB = b['Véhicules'].toUpperCase();
          if (nameA > nameB) {
            return -1;
          }
          if (nameA < nameB) {
            return 1;
          }
          return 0;
        });

        await razelXlsx(
          sortData,
          RALENTI_MOTEUR_RAZEL_GROUP,
          `${pathFile}-${titleDate}.xlsx`,
          columnRalentiMoteur,
          `${RAPPORT_RALENTI_MOTEUR_RAZEL} ${titleDate}`
        );
      })

      //conduite de nuit disting unit to detail
      /*  .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          CONDUITE_DE_NUIT_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          CONDUITE_DE_NUIT_RAZEL_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => conduiteDeNuit.push(item));
            } else {
              console.log(
                `no data found in data unit ${CONDUITE_DE_NUIT_RAZEL} ${CONDUITE_DE_NUIT_RAZEL_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              CONDUITE_DE_NUIT_RAZEL,
              RAZEL_PL,
              firstHourDay,
              lastHourDay,
              CONDUITE_DE_NUIT_RAZEL_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) =>
                  conduiteDeNuit.push(item)
                );

                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'conduite-nuit' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${CONDUITE_DE_NUIT_RAZEL} ${CONDUITE_DE_NUIT_RAZEL_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = conduiteDeNuit.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              CONDUITE_DE_NUIT_RAZEL_GROUP,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${CONDUITE_DE_NUIT_RAZEL} ${titleDate}`
            );
          });
      })
 */
      //conduite de weekend disting unit to detail
      /*   .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          CONDUITE_DE_WEEKEND_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          CONDUITE_DE_WEEKEND_RAZEL_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => conduitWeekend.push(item));
            } else {
              console.log(
                `no data found in data unit ${CONDUITE_DE_WEEKEND_RAZEL} ${CONDUITE_DE_WEEKEND_RAZEL_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              CONDUITE_DE_WEEKEND_RAZEL,
              RAZEL_PL,
              firstHourDay,
              lastHourDay,
              CONDUITE_DE_WEEKEND_RAZEL_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) =>
                  conduitWeekend.push(item)
                );

                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'conduite-weekend' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${CONDUITE_DE_WEEKEND_RAZEL} ${CONDUITE_DE_WEEKEND_RAZEL_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = conduitWeekend.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              CONDUITE_DE_WEEKEND_RAZEL,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${CONDUITE_DE_WEEKEND_RAZEL_GROUP} ${titleDate}`
            );
          });
      })
 */
      //Eco driving
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          ECO_DRIVING_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          ECO_DRIVING_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            let column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            //push all data in synthese Arr
            data.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'eco-driving' };
                synthese.push(newItem);
              }
            });

            await razelXlsx(
              replaceGroupinByVehicle,
              ECO_DRIVING_RAZEL_GROUP,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${ECO_DRIVING_RAZEL_GROUP} ${titleDate}`
            );
          } else {
            console.log(
              `no data found in ${ECO_DRIVING_RAZEL_GROUP} ${ECO_DRIVING_RAZEL_GROUP}`
            );
          }
        });
      })

      //Detail trajet
      /*   .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          DETAIL_TRAJET_FLOTTE_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          DETAIL_TRAJET_FLOTTE_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => detailTrajet.push(item));
            } else {
              console.log(
                `no data found in data unit ${DETAIL_TRAJET_FLOTTE_RAZEL} ${DETAIL_TRAJET_FLOTTE_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              DETAIL_TRAJET_FLOTTE_RAZEL,
              RAZEL_PL,
              firstHourDay,
              lastHourDay,
              DETAIL_TRAJET_FLOTTE_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) => detailTrajet.push(item));
                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'detail-trajet' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${DETAIL_TRAJET_FLOTTE_RAZEL} ${DETAIL_TRAJET_FLOTTE_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = detailTrajet.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              DETAIL_TRAJET_FLOTTE_RAZEL,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${DETAIL_TRAJET_FLOTTE_RAZEL} ${titleDate}`
            );
          });
      }) */

      //EXCes de vitess PL
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_EXCES_DE_VITESSE_AG_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          EXCES_DE_VITESSE_AG_PL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            column.push({ key: 'Vitesse Limite' });
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const addVitesseLimite = replaceGroupinByVehicle.map((item) => {
              return { ...item, 'Vitesse Limite': '30km/H' };
            });

            const removeDuplicateItem = _.uniqBy(
              addVitesseLimite,
              function (e) {
                return e['Durée'];
              }
            );

            //push all data in synthese Arr
            removeDuplicateItem.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'excess-vitesse-pl-AG' };
                synthese.push(newItem);
              }
            });

            await razelExesVitesseXlsx(
              removeDuplicateItem,
              'Exces de vitesse razel PL',
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `Exces de vitesse PL ${titleDate}`,
              'AGGLOMERATION'
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_EXCES_DE_VITESSE_AG_RAZEL} ${EXCES_DE_VITESSE_AG_PL_GROUP}`
            );
          }
        });
      })
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_EXCES_DE_VITESSE_HAG_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          EXCES_DE_VITESSE_HA_PL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            column.push({ key: 'Vitesse Limite' });
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const addVitesseLimite = replaceGroupinByVehicle.map((item) => {
              return { ...item, 'Vitesse Limite': '60km/H' };
            });

            const removeDuplicateItem = _.uniqBy(
              addVitesseLimite,
              function (e) {
                return e['Durée'];
              }
            );

            //push all data in synthese Arr
            removeDuplicateItem.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'excess-vitesse-pl-HAG' };
                synthese.push(newItem);
              }
            });

            await razelExesVitesseXlsx(
              removeDuplicateItem,
              'Exces de vitesse razel PL',
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `Exces de vitess PL ${titleDate}`,
              'HORS AGGLOMERATION'
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_EXCES_DE_VITESSE_HAG_RAZEL} ${EXCES_DE_VITESSE_HA_PL_GROUP}`
            );
          }
        });
      })

      //Razel PL synthese
      /*  .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_SYNTHESE_ACTIVITE_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          RAPPORT_SYNTHESE_ACTIVITE_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };

            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const formatArr = replaceGroupinByVehicle.map((item) => {
              return {
                Véhicules: item['Véhicules'],
                'Heure moteur': item['HEURE MOTEUR'],
                'Ralenti moteur': item['RALENTI MOTEUR'],
                'En mouvement': item['EN MOUVEMENT'],
                Kilométrage: item.KILOMETRAGE,
              };
            });

            //push all data in synthese Arr

            formatArr.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'synthese-pl' };
                synthese.push(newItem);
              }
            });

            //Group  By VehicleID
            const groupItemByVehicleGroup = _.groupBy(
              synthese,
              (synth) => synth['Véhicules']
            );

            //change objects to arr and remove key
            const arrData = Object.keys(groupItemByVehicleGroup).map((key) => {
              return Object.values(groupItemByVehicleGroup[[key]]);
            });

            const groupArrByTemplate = arrData.map((item) => {
              const group = _.groupBy(item, (it) => it['template']);
              return group;
            });

            //change objects to arr and remove key
            const arrGroup = Object.keys(groupArrByTemplate).map((key) => {
              return Object.values(groupArrByTemplate[[key]]);
            });

            const syntheseServices = arrGroup.map((item) => {
              return item.map((it) => {
                //count number of excess vitesse  aglommeration
                if (it[0]['template'] === 'excess-vitesse-pl-AG') {
                  const nbreAGPL = it.length;
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre d'exces de vitesse Agglomeration": nbreAGPL,
                  };
                }

                //count number of excess vitesse Hors aglommeration
                if (it[0]['template'] === 'excess-vitesse-pl-HAG') {
                  const nbreHAGPL = it.length;
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre d'exces de vitesse Hors Agglomeration": nbreHAGPL,
                  };
                }
                //count nbers of freinage,acceleration brusque,virage
                if (it[0]['template'] === 'eco-driving') {
                  const freinage = it.filter(
                    (item) => item.INFRACTION === 'Freinage Brusque'
                  ).length;
                  const accelerationExcess = it.filter(
                    (item) => item.INFRACTION === 'Accélération Excessif'
                  ).length;
                  const virage = it.filter(
                    (item) => item.INFRACTION === 'Harsh Corning'
                  ).length;

                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Acceleration excessives': accelerationExcess,
                    'Freinage Brusque': freinage,
                    Virage: virage,
                  };
                }

                //count numbr of ralenti moteur and extract total duree
                if (it[0]['template'] === 'ralenti-moteur') {
                  const nbreArret = it.length;
                  const totalDuree = calculateTimeGlobal(
                    it,
                    'DUREE ARRËT MOTEUR EN MARCHE'
                  );
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre D'arret": nbreArret,
                    "Duree d'arret": totalDuree,
                  };
                }

                //calculate numbr of duree de nuit  and extract km
                if (it[0]['template'] === 'conduite-nuit') {
                  const dureeNuit = calculateTimeGlobal(
                    it,
                    'Durée de conduite'
                  );
                  const kmNuit = it
                    .reduce(
                      (acc, item) => acc + parseFloat(item['Kilométrage']),
                      0
                    )
                    .toFixed(2);
                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Duree Conduite nuit': dureeNuit,
                    'Kilometrage nuit': kmNuit,
                  };
                }

                //calculate numbr of duree de weekend  and extract km
                if (it[0]['template'] === 'conduite-weekend') {
                  const dureeConduiteWeekend = calculateTimeGlobal(
                    it,
                    'Durée de conduite'
                  );
                  const kmNuit = it
                    .reduce(
                      (acc, item) => acc + parseFloat(item['Kilométrage']),
                      0
                    )
                    .toFixed(2);

                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Duree Conduite weekend': dureeConduiteWeekend,
                    'Kilometrage weekend': kmNuit,
                  };
                }

                if (it[0]['template'] === 'synthese-pl') {
                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Heure moteur': it[0]['Heure moteur'],
                    'Ralenti moteur': it[0]['Ralenti moteur'],
                    'En mouvements': it[0]['En mouvement'],
                    Kilométrage: it[0].Kilométrage,
                  };
                }
              });
            });

            //Merge objects Arr
            const mergObjects = syntheseServices.map((item) => {
              return item.reduce((r, c) => Object.assign(r, c), {});
            });

            //Range service
            const finalService = mergObjects.map((item) => {
              const rMoteur = item['Ralenti moteur'] || '00:00:00';
              const mvtM = item['En mouvements'] || '00:00:00';
              const hMoteur = item['Heure moteur'] || '00:00:00';
              const ralentiMoteurProd = divideTimesAsPercentage(
                rMoteur.toString(),
                hMoteur.toString()
              );
              const mvtProd = divideTimesAsPercentage(
                mvtM.toString(),
                hMoteur.toString()
              );
              return {
                Véhicules: item['Véhicules'],
                'Heure moteur (heure)': item['Heure moteur'] || '00:00:00',
                'Ralenti moteur (heure)': item['Ralenti moteur'] || '00:00:00',
                'En Mouvement (heure)': item['En mouvements'] || '00:00:00',
                'Kilométrage (km)': item['Kilométrage'] || 0,
                "Nbre d'exces de vitesse Agglomeration":
                  item["Nbre d'exces de vitesse Agglomeration"] || 0,
                "Nbre d'exces de vitesse Hors Agglomeration":
                  item["Nbre d'exces de vitesse Hors Agglomeration"] || 0,
                'Acceleration excessives': item['Acceleration excessives'] || 0,
                'Freinage Brusque': item['Freinage Brusque'] || 0,
                Virage: item.Virage || 0,
                "Nbre D'arret": item["Nbre D'arret"] || 0,
                "Duree d'arret (heure)": item["Duree d'arret"] || 0,
                'Duree Conduite weekend (heure)':
                  item['Duree Conduite weekend'] || '00:00:00',
                'Kilometrage weekend (km)': item['Kilometrage weekend'] || 0,
                'Duree Conduite nuit (heure)':
                  item['Duree Conduite nuit'] || '00:00:00',
                'Kilometrage nuit (km)': item['Kilometrage nuit'] || 0,
                'Ralenti Moteur (%)': ralentiMoteurProd.toFixed(2) + '%' || 0,
                'En mouvement (%)': mvtProd.toFixed(2) + '%' || 0,
              };
            });

            await razelSynthese(
              `${pathFile}-${titleDate}.xlsx`,
              finalService,
              'Synthese',
              `Rapport Synthèse activité : RAZEL PL,${titleDate}`
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_SYNTHESE_ACTIVITE_RAZEL} ${RAPPORT_SYNTHESE_ACTIVITE_RAZEL_GROUP}`
            );
          }
        });
      }) */

      // send mail

      .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(
              sender,
              receivers,
              pass,
              RAPPORT_JOURNALIER_TRUCKS_RAZEL,
              `${ACTIVITY_REPORT_SUBJECT_MAIL_RAZEL_PL_DAY}`,
              `${RAPPORT_JOURNALIER_TRUCKS_RAZEL}.xlsx`,
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
            deleteFile(
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
          }, 180000);
        }
      })

      .catch((err) => console.log(err));
  } catch (err) {
    console.error(err);
  }
}

async function generateWeeklyRepportRazelPL() {
  try {
    const synthese = [];
    const conduiteDeNuit = [];
    const ralentiMoteur = [];
    const detailTrajet = [];
    const conduitWeekend = [];
    const sender = await Senders(RAZEL, 'E');
    const receivers = await Receivers(RAZEL, 'D');
    /*    const sender = 'rapport.sav@camtrack.net';
    const receivers = [
      'franky.shity@camtrack.net',
      '	j.belloy@razel-bec.fayat.com',
      'lrichard@razel.fr',
      'ageorge@razel.fr',
      'wketchankeu@razel.fr',
      'wmbassi@razel.fr',
      'Andjele@razel.fr',
      'joel.youassi@camtrack.net',
      'sav@camtrack.net',
    ]; */

    const fistAndLastHourDay = getFirstAndLastSevendays();
    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;
    const titleDate = fistAndLastHourDay.dateTitle;

    /*const firstHourDay = '1734130800';
    const lastHourDay = '1734217199';
    const titleDate = fistAndLastHourDay.dateTitle; */
    const pathFile = 'rapport/razel/RAPPORT-ACTIVITE-FLOTTE-RAZEL-PL';

    // Ralenti moteur distinct synthese to detail

    let columnRalentiMoteur;
    await getRepportDataUnit(
      ADMIN_RAZEL,
      RAPPORT_RALENTI_MOTEUR_RAZEL,
      RAZEL_PL,
      firstHourDay,
      lastHourDay,
      RALENTI_MOTEUR_RAZEL_GROUP
    )
      .then(async (res) => {
        const objLenth = res?.obj.length;
        if (objLenth > 0) {
          const data = res.obj;

          const addMarkerToUnit = data.map((item) => ({
            ...item,
            Véhicules: `${item['Grouping'] + '-unit'}`,
          }));
          addMarkerToUnit.map((item) => ralentiMoteur.push(item));
        } else {
          console.log(
            `no data found in data unit ${RAPPORT_RALENTI_MOTEUR_RAZEL} ${RALENTI_MOTEUR_RAZEL_GROUP}`
          );
        }
      })
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_RALENTI_MOTEUR_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          RALENTI_MOTEUR_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            columnRalentiMoteur = res.excelColum;
            columnRalentiMoteur[0] = { key: 'Véhicules' };
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );
            replaceGroupinByVehicle.map((item) => ralentiMoteur.push(item));
            //push all data in synthese Arr
            data.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'ralenti-moteur' };
                synthese.push(newItem);
              }
            });
          } else {
            console.log(
              `no data found in ${RAPPORT_RALENTI_MOTEUR_RAZEL} ${RALENTI_MOTEUR_RAZEL_GROUP}`
            );
          }
        });
      })
      .then(async () => {
        const sortData = ralentiMoteur.sort((a, b) => {
          const nameA = a['Véhicules'].toUpperCase();
          const nameB = b['Véhicules'].toUpperCase();
          if (nameA > nameB) {
            return -1;
          }
          if (nameA < nameB) {
            return 1;
          }
          return 0;
        });

        await razelXlsx(
          sortData,
          RALENTI_MOTEUR_RAZEL_GROUP,
          `${pathFile}-${titleDate}.xlsx`,
          columnRalentiMoteur,
          `${RAPPORT_RALENTI_MOTEUR_RAZEL} ${titleDate}`
        );
      })

      //conduite de nuit disting unit to detail
      .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          CONDUITE_DE_NUIT_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          CONDUITE_DE_NUIT_RAZEL_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => conduiteDeNuit.push(item));
            } else {
              console.log(
                `no data found in data unit ${CONDUITE_DE_NUIT_RAZEL} ${CONDUITE_DE_NUIT_RAZEL_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              CONDUITE_DE_NUIT_RAZEL,
              RAZEL_PL,
              firstHourDay,
              lastHourDay,
              CONDUITE_DE_NUIT_RAZEL_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) =>
                  conduiteDeNuit.push(item)
                );

                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'conduite-nuit' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${CONDUITE_DE_NUIT_RAZEL} ${CONDUITE_DE_NUIT_RAZEL_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = conduiteDeNuit.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              CONDUITE_DE_NUIT_RAZEL_GROUP,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${CONDUITE_DE_NUIT_RAZEL} ${titleDate}`
            );
          });
      })

      //conduite de weekend disting unit to detail
      .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          CONDUITE_DE_WEEKEND_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          CONDUITE_DE_WEEKEND_RAZEL_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => conduitWeekend.push(item));
            } else {
              console.log(
                `no data found in data unit ${CONDUITE_DE_WEEKEND_RAZEL} ${CONDUITE_DE_WEEKEND_RAZEL_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              CONDUITE_DE_WEEKEND_RAZEL,
              RAZEL_PL,
              firstHourDay,
              lastHourDay,
              CONDUITE_DE_WEEKEND_RAZEL_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) =>
                  conduitWeekend.push(item)
                );

                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'conduite-weekend' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${CONDUITE_DE_WEEKEND_RAZEL} ${CONDUITE_DE_WEEKEND_RAZEL_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = conduitWeekend.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              CONDUITE_DE_WEEKEND_RAZEL,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${CONDUITE_DE_WEEKEND_RAZEL_GROUP} ${titleDate}`
            );
          });
      })

      //Eco driving
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          ECO_DRIVING_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          ECO_DRIVING_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            //push all data in synthese Arr
            data.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'eco-driving' };
                synthese.push(newItem);
              }
            });

            await razelXlsx(
              replaceGroupinByVehicle,
              ECO_DRIVING_RAZEL_GROUP,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${ECO_DRIVING_RAZEL_GROUP} ${titleDate}`
            );
          } else {
            console.log(
              `no data found in ${ECO_DRIVING_RAZEL_GROUP} ${ECO_DRIVING_RAZEL_GROUP}`
            );
          }
        });
      })

      //Detail trajet
      .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_RAZEL,
          DETAIL_TRAJET_FLOTTE_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          DETAIL_TRAJET_FLOTTE_GROUP
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => detailTrajet.push(item));
            } else {
              console.log(
                `no data found in data unit ${DETAIL_TRAJET_FLOTTE_RAZEL} ${DETAIL_TRAJET_FLOTTE_GROUP}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_RAZEL,
              DETAIL_TRAJET_FLOTTE_RAZEL,
              RAZEL_PL,
              firstHourDay,
              lastHourDay,
              DETAIL_TRAJET_FLOTTE_GROUP
            ).then(async (res) => {
              const objLenth = res?.obj.length;
              if (objLenth > 0) {
                const data = res.obj;
                column = res.excelColum;
                column[0] = { key: 'Véhicules' };
                const replaceGroupinByVehicle = replaceProps(
                  data,
                  'Grouping',
                  'Véhicules'
                );
                replaceGroupinByVehicle.map((item) => detailTrajet.push(item));
                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'detail-trajet' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${DETAIL_TRAJET_FLOTTE_RAZEL} ${DETAIL_TRAJET_FLOTTE_GROUP}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = detailTrajet.sort((a, b) => {
              const nameA = a['Véhicules'].toUpperCase();
              const nameB = b['Véhicules'].toUpperCase();
              if (nameA > nameB) {
                return -1;
              }
              if (nameA < nameB) {
                return 1;
              }
              return 0;
            });

            await razelXlsx(
              sortData,
              DETAIL_TRAJET_FLOTTE_RAZEL,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${DETAIL_TRAJET_FLOTTE_RAZEL} ${titleDate}`
            );
          });
      })

      //EXCes de vitess PL
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_EXCES_DE_VITESSE_AG_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          EXCES_DE_VITESSE_AG_PL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            column.push({ key: 'Vitesse Limite' });
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const addVitesseLimite = replaceGroupinByVehicle.map((item) => {
              return { ...item, 'Vitesse Limite': '30km/H' };
            });

            const removeDuplicateItem = _.uniqBy(
              addVitesseLimite,
              function (e) {
                return e['Durée'];
              }
            );

            //push all data in synthese Arr
            removeDuplicateItem.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'excess-vitesse-pl-AG' };
                synthese.push(newItem);
              }
            });

            await razelExesVitesseXlsx(
              removeDuplicateItem,
              'Exces de vitesse razel PL',
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `Exces de vitesse PL ${titleDate}`,
              'AGGLOMERATION'
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_EXCES_DE_VITESSE_AG_RAZEL} ${EXCES_DE_VITESSE_AG_PL_GROUP}`
            );
          }
        });
      })
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_EXCES_DE_VITESSE_HAG_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          EXCES_DE_VITESSE_HA_PL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };
            column.push({ key: 'Vitesse Limite' });
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const addVitesseLimite = replaceGroupinByVehicle.map((item) => {
              return { ...item, 'Vitesse Limite': '60km/H' };
            });

            const removeDuplicateItem = _.uniqBy(
              addVitesseLimite,
              function (e) {
                return e['Durée'];
              }
            );

            //push all data in synthese Arr
            removeDuplicateItem.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'excess-vitesse-pl-HAG' };
                synthese.push(newItem);
              }
            });

            await razelExesVitesseXlsx(
              removeDuplicateItem,
              'Exces de vitesse razel PL',
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `Exces de vitess PL ${titleDate}`,
              'HORS AGGLOMERATION'
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_EXCES_DE_VITESSE_HAG_RAZEL} ${EXCES_DE_VITESSE_HA_PL_GROUP}`
            );
          }
        });
      })

      //Razel PL synthese
      .then(async () => {
        await getRepportData(
          ADMIN_RAZEL,
          RAPPORT_SYNTHESE_ACTIVITE_RAZEL,
          RAZEL_PL,
          firstHourDay,
          lastHourDay,
          RAPPORT_SYNTHESE_ACTIVITE_RAZEL_GROUP
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            column = res.excelColum;
            column[0] = { key: 'Véhicules' };

            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );

            const formatArr = replaceGroupinByVehicle.map((item) => {
              return {
                Véhicules: item['Véhicules'],
                'Heure moteur': item['HEURE MOTEUR'],
                'Ralenti moteur': item['RALENTI MOTEUR'],
                'En mouvement': item['EN MOUVEMENT'],
                Kilométrage: item.KILOMETRAGE,
              };
            });

            //push all data in synthese Arr

            formatArr.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'synthese-pl' };
                synthese.push(newItem);
              }
            });

            //Group  By VehicleID
            const groupItemByVehicleGroup = _.groupBy(
              synthese,
              (synth) => synth['Véhicules']
            );

            //change objects to arr and remove key
            const arrData = Object.keys(groupItemByVehicleGroup).map((key) => {
              return Object.values(groupItemByVehicleGroup[[key]]);
            });

            const groupArrByTemplate = arrData.map((item) => {
              const group = _.groupBy(item, (it) => it['template']);
              return group;
            });

            //change objects to arr and remove key
            const arrGroup = Object.keys(groupArrByTemplate).map((key) => {
              return Object.values(groupArrByTemplate[[key]]);
            });

            const syntheseServices = arrGroup.map((item) => {
              return item.map((it) => {
                //count number of excess vitesse  aglommeration
                if (it[0]['template'] === 'excess-vitesse-pl-AG') {
                  const nbreAGPL = it.length;
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre d'exces de vitesse Agglomeration": nbreAGPL,
                  };
                }

                //count number of excess vitesse Hors aglommeration
                if (it[0]['template'] === 'excess-vitesse-pl-HAG') {
                  const nbreHAGPL = it.length;
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre d'exces de vitesse Hors Agglomeration": nbreHAGPL,
                  };
                }
                //count nbers of freinage,acceleration brusque,virage
                if (it[0]['template'] === 'eco-driving') {
                  const freinage = it.filter(
                    (item) => item.INFRACTION === 'Freinage Brusque'
                  ).length;
                  const accelerationExcess = it.filter(
                    (item) => item.INFRACTION === 'Accélération Excessif'
                  ).length;
                  const virage = it.filter(
                    (item) => item.INFRACTION === 'Harsh Corning'
                  ).length;

                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Acceleration excessives': accelerationExcess,
                    'Freinage Brusque': freinage,
                    Virage: virage,
                  };
                }

                //count numbr of ralenti moteur and extract total duree
                if (it[0]['template'] === 'ralenti-moteur') {
                  const nbreArret = it.length;
                  const totalDuree = calculateTimeGlobal(
                    it,
                    'DUREE ARRËT MOTEUR EN MARCHE'
                  );
                  return {
                    Véhicules: it[0]['Véhicules'],
                    "Nbre D'arret": nbreArret,
                    "Duree d'arret": totalDuree,
                  };
                }

                //calculate numbr of duree de nuit  and extract km
                if (it[0]['template'] === 'conduite-nuit') {
                  const dureeNuit = calculateTimeGlobal(
                    it,
                    'Durée de conduite'
                  );
                  const kmNuit = it
                    .reduce(
                      (acc, item) => acc + parseFloat(item['Kilométrage']),
                      0
                    )
                    .toFixed(2);
                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Duree Conduite nuit': dureeNuit,
                    'Kilometrage nuit': kmNuit,
                  };
                }

                //calculate numbr of duree de weekend  and extract km
                if (it[0]['template'] === 'conduite-weekend') {
                  const dureeConduiteWeekend = calculateTimeGlobal(
                    it,
                    'Durée de conduite'
                  );
                  const kmNuit = it
                    .reduce(
                      (acc, item) => acc + parseFloat(item['Kilométrage']),
                      0
                    )
                    .toFixed(2);

                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Duree Conduite weekend': dureeConduiteWeekend,
                    'Kilometrage weekend': kmNuit,
                  };
                }

                if (it[0]['template'] === 'synthese-pl') {
                  return {
                    Véhicules: it[0]['Véhicules'],
                    'Heure moteur': it[0]['Heure moteur'],
                    'Ralenti moteur': it[0]['Ralenti moteur'],
                    'En mouvements': it[0]['En mouvement'],
                    Kilométrage: it[0].Kilométrage,
                  };
                }
              });
            });

            //Merge objects Arr
            const mergObjects = syntheseServices.map((item) => {
              return item.reduce((r, c) => Object.assign(r, c), {});
            });

            //Range service
            const finalService = mergObjects.map((item) => {
              const rMoteur = item['Ralenti moteur'] || '00:00:00';
              const mvtM = item['En mouvements'] || '00:00:00';
              const hMoteur = item['Heure moteur'] || '00:00:00';
              const ralentiMoteurProd = divideTimesAsPercentage(
                rMoteur.toString(),
                hMoteur.toString()
              );
              const mvtProd = divideTimesAsPercentage(
                mvtM.toString(),
                hMoteur.toString()
              );
              return {
                Véhicules: item['Véhicules'],
                'Heure moteur (heure)': item['Heure moteur'] || '00:00:00',
                'Ralenti moteur (heure)': item['Ralenti moteur'] || '00:00:00',
                'En Mouvement (heure)': item['En mouvements'] || '00:00:00',
                'Kilométrage (km)': item['Kilométrage'] || 0,
                "Nbre d'exces de vitesse Agglomeration":
                  item["Nbre d'exces de vitesse Agglomeration"] || 0,
                "Nbre d'exces de vitesse Hors Agglomeration":
                  item["Nbre d'exces de vitesse Hors Agglomeration"] || 0,
                'Acceleration excessives': item['Acceleration excessives'] || 0,
                'Freinage Brusque': item['Freinage Brusque'] || 0,
                Virage: item.Virage || 0,
                "Nbre D'arret": item["Nbre D'arret"] || 0,
                "Duree d'arret (heure)": item["Duree d'arret"] || 0,
                'Duree Conduite weekend (heure)':
                  item['Duree Conduite weekend'] || '00:00:00',
                'Kilometrage weekend (km)': item['Kilometrage weekend'] || 0,
                'Duree Conduite nuit (heure)':
                  item['Duree Conduite nuit'] || '00:00:00',
                'Kilometrage nuit (km)': item['Kilometrage nuit'] || 0,
                'Ralenti Moteur (%)': ralentiMoteurProd.toFixed(2) + '%' || 0,
                'En mouvement (%)': mvtProd.toFixed(2) + '%' || 0,
              };
            });

            await razelSynthese(
              `${pathFile}-${titleDate}.xlsx`,
              finalService,
              'Synthese',
              `Rapport Synthèse activité : RAZEL PL,${titleDate}`
            );
          } else {
            console.log(
              `no data found in ${RAPPORT_SYNTHESE_ACTIVITE_RAZEL} ${RAPPORT_SYNTHESE_ACTIVITE_RAZEL_GROUP}`
            );
          }
        });
      })

      //send mail
      .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(
              sender,
              receivers,
              pass,
              RAPPORT_HEBDOMADAIRE_TRUCKS_RAZEL,
              `${ACTIVITY_REPORT_SUBJECT_MAIL_RAZEL_PL_WEEK}`,
              `${RAPPORT_HEBDOMADAIRE_TRUCKS_RAZEL}.xlsx`,
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
            deleteFile(
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
          }, 180000);
        }
      })

      .catch((err) => console.log(err));
  } catch (err) {
    console.error(err);
  }
}

async function generateAllRepportRazel() {
  //await generateDaylyRepportRazelVL();
  //await generateDaylyRepportRazelPL();
  //await generateWeeklyRepportRazelVL();
  //await generateWeeklyRepportRazelPL();
  cron.schedule(
    '30 06 * * *',
    async () => {
      await generateDaylyRepportRazelVL();
      await generateDaylyRepportRazelPL();
    },
    {
      scheduled: true,
      timezone: 'Africa/Lagos',
    }
  );

  cron.schedule(
    '30 06 * * Monday',
    async () => {
      await generateWeeklyRepportRazelVL();
      await generateWeeklyRepportRazelPL();
    },
    {
      scheduled: true,
      timezone: 'Africa/Lagos',
    }
  );
}

module.exports = { generateAllRepportRazel };
