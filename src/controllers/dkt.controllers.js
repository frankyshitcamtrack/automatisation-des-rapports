const path = require('path');
const cron = require('node-cron');
const _ = require('lodash');

const { getRepportData, getRepportDataUnit } = require('../models/models');
const {
  razelXlsx,
  razelExesVitesseXlsx,
  razelSynthese,
} = require('../utils/genrateXlsx');
const { replaceProps } = require('../utils/replaceProperties');
const {
  getFirstAndLastDayMonth,
} = require('../utils/getFistDayAndLastDayMonth');

const { perencoXlsx } = require('../utils/genrateXlsx');
const { deleteFile } = require('../utils/deleteFile');
const { calculateTime } = require('../utils/sommeArrTimes');
const { Receivers } = require('../storage/mailReceivers.storage');
const { Senders } = require('../storage/mailSender.storage');
const { sendMail } = require('../utils/sendMail');
const { DKT } = require('../constants/clients');
const { ADMIN_DKT } = require('../constants/ressourcesClient');
const { RAPPORT_DKT } = require('../constants/template');
const {
  ACTIVITY_REPORT_SUBJECT_MAIL_DKT_MONTH,
} = require('../constants/mailSubjects');

const pass = process.env.PASS_MAIL_SAV;

const {
  SYNTHESE_DKT,
  STATIONNEMENT_ON,
  ECO_DRIVING_DKT,
  CONDUITE_DE_NUIT_DKT,
  EXCES_DE_VITESSE_DKT,
  DETAIL_TRAJET_VEHICULE_DKT,
  CONDUITE_WEEKEND_DKT,
} = require('../constants/subGroups');

const { json } = require('body-parser');

async function generateDaylyRepportDKT() {
  try {
    const synthese = [];
    //const sender = await Senders(PERENCO, 'E');
    //const receivers = await Receivers(PERENCO, 'D');
    const fistAndLastHourDay = getFirstAndLastDayMonth();
    const firstHourDay = fistAndLastHourDay.firstDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastDayTimestamp;

    const titleDate = fistAndLastHourDay.dateTitle;
    const pathFile = 'rapport/dkt/RAPPORT-Mensuel-DKT-CAMEROUN';

    await getRepportData(
      ADMIN_DKT,
      RAPPORT_DKT,
      DKT,
      firstHourDay,
      lastHourDay,
      ECO_DRIVING_DKT
    )
      .then(async (res) => {
        const objLenth = res?.obj.length;
        if (objLenth > 0) {
          const data = res.obj;
          const column = res.excelColum;

          await perencoXlsx(
            data,
            ECO_DRIVING_DKT,
            `${pathFile}-${titleDate}.xlsx`,
            column
          );
        } else {
          console.log(`no data found in ${RAPPORT_DKT} ${ECO_DRIVING_DKT}`);
        }
      })
      .then(async () => {
        await getRepportData(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          STATIONNEMENT_ON
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;

              await perencoXlsx(
                data,
                STATIONNEMENT_ON,
                `${pathFile}-${titleDate}.xlsx`,
                column
              );
            } else {
              console.log(
                `no data found in ${RAPPORT_DKT} ${STATIONNEMENT_ON}`
              );
            }
          })
          .catch((err) => console.log(err));
      })
      .then(async () => {
        await getRepportData(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          CONDUITE_DE_NUIT_DKT
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;

              await perencoXlsx(
                data,
                CONDUITE_DE_NUIT_DKT,
                `${pathFile}-${titleDate}.xlsx`,
                column
              );
            } else {
              console.log(
                `no data found in ${RAPPORT_DKT} ${CONDUITE_DE_NUIT_DKT}`
              );
            }
          })
          .catch((err) => console.log(err));
      })
      .then(async () => {
        await getRepportData(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          EXCES_DE_VITESSE_DKT
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;

              await perencoXlsx(
                data,
                EXCES_DE_VITESSE_DKT,
                `${pathFile}-${titleDate}.xlsx`,
                column
              );
            } else {
              console.log(
                `no data found in ${RAPPORT_DKT} ${EXCES_DE_VITESSE_DKT}`
              );
            }
          })
          .catch((err) => console.log(err));
      })
      .then(async () => {
        await getRepportData(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          DETAIL_TRAJET_VEHICULE_DKT
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;

              await perencoXlsx(
                data,
                DETAIL_TRAJET_VEHICULE_DKT,
                `${pathFile}-${titleDate}.xlsx`,
                column
              );
            } else {
              console.log(
                `no data found in ${RAPPORT_DKT} ${DETAIL_TRAJET_VEHICULE_DKT}`
              );
            }
          })
          .catch((err) => console.log(err));
      })
      .then(async () => {
        await getRepportData(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          CONDUITE_WEEKEND_DKT
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;

              await perencoXlsx(
                data,
                CONDUITE_WEEKEND_DKT,
                `${pathFile}-${titleDate}.xlsx`,
                column
              );
            } else {
              console.log(
                `no data found in ${RAPPORT_DKT} ${CONDUITE_WEEKEND_DKT}`
              );
            }
          })
          .catch((err) => console.log(err));
      })
      .then(async () => {
        await getRepportData(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          SYNTHESE_DKT
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;
              const column = res.excelColum;

              await perencoXlsx(
                data,
                SYNTHESE_DKT,
                `${pathFile}-${titleDate}.xlsx`,
                column
              );
            } else {
              console.log(`no data found in ${RAPPORT_DKT} ${SYNTHESE_DKT}`);
            }
          })
          .catch((err) => console.log(err));
      })

      //send mail
      /*     .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(
              sender,
              receivers,
              pass,
              RAPPORT_ACTIVITE_FLOTTE_PERENCO,
              `${ACTIVITY_REPORT_SUBJECT_MAIL_PERENCO_DAY}`,
              `${RAPPORT_ACTIVITE_FLOTTE_PERENCO}.xlsx`,
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
            deleteFile(
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
          }, 30000);
        }
      }) */
      .catch((err) => console.log(err));
  } catch (err) {
    console.error(err);
  }
}

async function generateMonthlyRepportDKT() {
  try {
    const synthese = [];
    const conduiteDeNuit = [];
    const ecodriving = [];
    const stationnement = [];
    const detailTrajet = [];
    const excesVitesse = [];
    const conduitWeekend = [];
    //const sender = await Senders(RAZEL_PL, 'E');
    //const receivers = await Receivers(RAZEL_PL, 'D');
    const sender = 'rapport.sav@camtrack.net';
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

    const fistAndLastHourDay = getFirstAndLastDayMonth();
    const firstHourDay = fistAndLastHourDay.firstDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastDayTimestamp;

    const titleDate = fistAndLastHourDay.dateTitle;
    const pathFile = 'rapport/dkt/RAPPORT-Mensuel-DKT-CAMEROUN';
    // EcoDriving distinct synthese to detail
    let columnEcoDriving;
    await getRepportDataUnit(
      ADMIN_DKT,
      RAPPORT_DKT,
      DKT,
      firstHourDay,
      lastHourDay,
      ECO_DRIVING_DKT
    )
      .then(async (res) => {
        const objLenth = res?.obj.length;
        if (objLenth > 0) {
          const data = res.obj;

          const addMarkerToUnit = data.map((item) => ({
            ...item,
            Véhicules: `${item['Grouping'] + '-unit'}`,
          }));
          addMarkerToUnit.map((item) => ecodriving.push(item));
        } else {
          console.log(
            `no data found in data unit ${RAPPORT_DKT} ${ECO_DRIVING_DKT}`
          );
        }
      })
      .then(async () => {
        await getRepportData(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          ECO_DRIVING_DKT
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            columnEcoDriving = res.excelColum;
            columnEcoDriving[0] = { key: 'Véhicules' };
            const replaceGroupinByVehicle = replaceProps(
              data,
              'Grouping',
              'Véhicules'
            );
            replaceGroupinByVehicle.map((item) => ecodriving.push(item));
            //push all data in synthese Arr
            data.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'eco-diving' };
                synthese.push(newItem);
              }
            });
          } else {
            console.log(`no data found in ${RAPPORT_DKT} ${ECO_DRIVING_DKT}`);
          }
        });
      })
      .then(async () => {
        const sortData = ecodriving.sort((a, b) => {
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
          ECO_DRIVING_DKT,
          `${pathFile}-${titleDate}.xlsx`,
          columnEcoDriving,
          `${RAPPORT_DKT} ${titleDate}`
        );
      })

      //stationnement disting unit to detail
      .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          STATIONNEMENT_ON
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => stationnement.push(item));
            } else {
              console.log(
                `no data found in data unit ${RAPPORT_DKT} ${STATIONNEMENT_ON}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_DKT,
              RAPPORT_DKT,
              DKT,
              firstHourDay,
              lastHourDay,
              STATIONNEMENT_ON
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
                replaceGroupinByVehicle.map((item) => stationnement.push(item));

                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'stationnement' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${RAPPORT_DKT} ${STATIONNEMENT_ON}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = stationnement.sort((a, b) => {
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
              STATIONNEMENT_ON,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${STATIONNEMENT_ON} ${titleDate}`
            );
          });
      })

      //conduite de nuit disting unit to detail
      .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          CONDUITE_DE_NUIT_DKT
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
                `no data found in data unit ${RAPPORT_DKT} ${CONDUITE_DE_NUIT_DKT}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_DKT,
              RAPPORT_DKT,
              DKT,
              firstHourDay,
              lastHourDay,
              CONDUITE_DE_NUIT_DKT
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
                  `no data found in ${RAPPORT_DKT} ${CONDUITE_DE_NUIT_DKT}`
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
              CONDUITE_DE_NUIT_DKT,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${CONDUITE_DE_NUIT_DKT} ${titleDate}`
            );
          });
      })

      //Detail trajet
      .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          DETAIL_TRAJET_VEHICULE_DKT
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
                `no data found in data unit ${RAPPORT_DKT} ${DETAIL_TRAJET_VEHICULE_DKT}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_DKT,
              RAPPORT_DKT,
              DKT,
              firstHourDay,
              lastHourDay,
              DETAIL_TRAJET_VEHICULE_DKT
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
                  `no data found in ${RAPPORT_DKT} ${DETAIL_TRAJET_VEHICULE_DKT}`
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
              DETAIL_TRAJET_VEHICULE_DKT,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${DETAIL_TRAJET_VEHICULE_DKT} ${titleDate}`
            );
          });
      })

      //exces de vitesse
      .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          EXCES_DE_VITESSE_DKT
        )
          .then(async (res) => {
            const objLenth = res?.obj.length;
            if (objLenth > 0) {
              const data = res.obj;

              const addMarkerToUnit = data.map((item) => ({
                ...item,
                Véhicules: `${item['Grouping'] + '-unit'}`,
              }));
              addMarkerToUnit.map((item) => excesVitesse.push(item));
            } else {
              console.log(
                `no data found in data unit ${RAPPORT_DKT} ${EXCES_DE_VITESSE_DKT}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_DKT,
              RAPPORT_DKT,
              DKT,
              firstHourDay,
              lastHourDay,
              EXCES_DE_VITESSE_DKT
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
                replaceGroupinByVehicle.map((item) => excesVitesse.push(item));
                //push all data in synthese Arr
                data.map((item) => {
                  if (item) {
                    const newItem = { ...item, template: 'exces-vitesse' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${RAPPORT_DKT} ${EXCES_DE_VITESSE_DKT}`
                );
              }
            });
          })
          .then(async () => {
            const sortData = excesVitesse.sort((a, b) => {
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
              RAPPORT_DKT,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${EXCES_DE_VITESSE_DKT} ${titleDate}`
            );
          });
      })

      .then(async () => {
        let column;
        await getRepportDataUnit(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          CONDUITE_WEEKEND_DKT
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
                `no data found in data unit ${RAPPORT_DKT} ${CONDUITE_WEEKEND_DKT}`
              );
            }
          })
          .then(async () => {
            await getRepportData(
              ADMIN_DKT,
              RAPPORT_DKT,
              DKT,
              firstHourDay,
              lastHourDay,
              CONDUITE_WEEKEND_DKT
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
                    const newItem = { ...item, template: 'conduit-weekend' };
                    synthese.push(newItem);
                  }
                });
              } else {
                console.log(
                  `no data found in ${RAPPORT_DKT} ${CONDUITE_WEEKEND_DKT}`
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
              CONDUITE_WEEKEND_DKT,
              `${pathFile}-${titleDate}.xlsx`,
              column,
              `${CONDUITE_WEEKEND_DKT} ${titleDate}`
            );
          });
      })

      //synthese
      /*    .then(async () => {
        await getRepportData(
          ADMIN_DKT,
          RAPPORT_DKT,
          DKT,
          firstHourDay,
          lastHourDay,
          SYNTHESE_DKT
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

      //send mail
      /*   .then(() => {
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
 */
      .catch((err) => console.log(err));
  } catch (err) {
    console.error(err);
  }
}

async function generateAllRepportDKT() {
  await generateMonthlyRepportDKT();

  cron.schedule(
    '30 6 3 1,2,3,4,5,6,7,8,9,10,11,12 *',
    async () => {
      await generateMonthlyRepportDKT();
    },
    {
      scheduled: true,
      timezone: 'Africa/Lagos',
    }
  );
}

module.exports = { generateAllRepportDKT };
