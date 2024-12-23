const path = require('path');
const cron = require('node-cron');
const _ = require('lodash');

const { getRepportData } = require('../models/models');
const { getFirstAndLastSevendays } = require('../utils/getFirstAndLastHourDay');
const {
  getFirstAndLastDayMonth,
} = require('../utils/getFistDayAndLastDayMonth');
const { getStringDay } = require('../utils/getDateProps');

const { KPDCXlsx, generateDashbordKPDC } = require('../utils/genrateXlsx');
const { deleteFile } = require('../utils/deleteFile');
const { Receivers } = require('../storage/mailReceivers.storage');
const { Senders } = require('../storage/mailSender.storage');
const { sendMail } = require('../utils/sendMail');
const { KPDC } = require('../constants/clients');
const { ADMIN_GLOBELEQ } = require('../constants/ressourcesClient');
const {
  ACTIVITY_REPORT_SUBJECT_MAIL_KPDC_WEEK,
  ACTIVITY_REPORT_SUBJECT_MAIL_KPDC_MONTH,
} = require('../constants/mailSubjects');
const {
  DETAIL_TRAJET_FLOTTE,
  EXCES_DE_VITESSE_FLOTTE,
  RAPPORT_GLOBELEQ_NOUVEAU_MODULE_KPDC,
  STATIONNEMENT_ON_OFF,
  RAPPORT_HEBDOMADAIRE_KPDC_KRIBI,
  RAPPORT_MENSUEL_KPDC_KRIBI,
} = require('../constants/template');

const pass = process.env.PASS_MAIL_SAV;

const {
  TRAJET_FLOTTE_KPDC,
  EXCES_VITESSE_FLOTTE_KPDC,
  HARSH_BRAKING,
  CONTACT_ON,
  ARRET_MOTEUR,
  DASHBORD,
} = require('../constants/subGroups');

const { json } = require('body-parser');

async function generateHebdoRepportKPDC() {
  try {
    const synthese = [];
    const sender = await Senders(KPDC, 'E');
    const receivers = await Receivers(KPDC, 'D');
    const fistAndLastHourDay = getFirstAndLastSevendays();
    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;

    //const firstHourDay = '1731625200';
    //const lastHourDay = '1732143599';
    const titleDate = fistAndLastHourDay.dateTitle;
    const pathFile = 'rapport/kpdc/RAPPORT-HEBDOMADAIRE-KPDC-KRIBI';

    await getRepportData(
      ADMIN_GLOBELEQ,
      DETAIL_TRAJET_FLOTTE,
      KPDC,
      firstHourDay,
      lastHourDay,
      TRAJET_FLOTTE_KPDC
    )
      .then(async (res) => {
        const objLenth = res?.obj.length;
        if (objLenth > 0) {
          const data = res.obj;
          const column = res.excelColum;

          /* range columns values to get needed element (Jours,Conducteur,Vehicule,Utilisation vehicule,Distance,
          heure de depart,lieu de depart,heure d'arriver,lieu d'ariver) */
          if (column.length > 0) {
            // remove the Grouping property at the begining of array
            column.shift();

            //remove the Arrets property at the last position of array
            column.pop();

            //add Jours property at the begining of the collunm
            column.unshift({ key: 'Jours' });

            //remove debut,fin,duree,ralentie moteur,Vitesse moyenne,Arrets properties
            column.splice(1, 2, { key: 'Conducteur' });
            column.splice(2, 3, { key: 'Vehicule' });
            column.splice(3, 4, { key: 'Utilisation Vehicule' });
            column.splice(4, 5, { key: 'Distance' });
            column.splice(5, 6, { key: 'Heure de depart' });
            column.splice(6, 7, { key: 'Lieu de depart' });
            column.splice(7, 8, { key: 'Heure d arriver' });
            column.splice(8, 9, { key: 'Lieu d arriver' });
          }

          const rangeData = data.map((item) => {
            if (item) {
              const extractDateDebut = item['Début']
                ? item['Début'].text.split(' ')[0]
                : '';

              const day = getStringDay(extractDateDebut);

              return {
                Jours: day,
                Conducteur: item.Conducteur,
                Vehicule: item.Grouping,
                'Utilisation Vehicule': item['Durée'],
                Distance: item.Distance,
                'Heure de depart': item['Début'],
                'Lieu de depart': item['Lieu de Départ'],
                'Heure d arriver': item.Fin,
                'Lieu d arriver': item["Lieu d'arrivée"],
              };
            }
          });

          rangeData.map((item) => {
            if (item) {
              const newItem = { ...item, template: 'trajet' };
              synthese.push(newItem);
            }
          });

          await KPDCXlsx(
            rangeData,
            TRAJET_FLOTTE_KPDC,
            `${pathFile}-${titleDate}.xlsx`,
            column
          );
        } else {
          console.log(
            `no data found in ${DETAIL_TRAJET_FLOTTE} ${TRAJET_FLOTTE_KPDC}`
          );
        }
      })

      .then(async () => {
        await getRepportData(
          ADMIN_GLOBELEQ,
          RAPPORT_GLOBELEQ_NOUVEAU_MODULE_KPDC,
          KPDC,
          firstHourDay,
          lastHourDay,
          HARSH_BRAKING
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            const column = res.excelColum;
            if (column.length > 0) {
              //add Jours property at the begining of the collunm
              column.unshift({ key: 'Jours' });

              column.splice(1, 2, { key: 'Noms des conducteurs' });
              column.splice(2, 3, { key: 'Vehicule' });
              column.splice(3, 4, { key: 'Nombre de recurrence' });
              column.splice(4, 5, { key: 'Emplacements' });
              column.splice(5, 6, { key: 'Dates' });
              column.splice(6, 7, { key: 'Heure' });
              column.splice(7, 8, { key: 'Vitesse' });
            }

            const rangeData = data.map((item) => {
              if (item) {
                const dat = item['Début'] ? item['Début'].text : '';

                const extractDateDebut = dat ? dat.split(' ') : '';

                const day = getStringDay(extractDateDebut);

                return {
                  Jours: day,
                  'Noms des conducteurs': item.Conducteur,
                  Vehicule: item.Grouping,
                  'Nombre de recurrence': item['NBRE DE FREINAGE'],
                  Emplacements: item['Emplacement initial'],
                  Dates: extractDateDebut[0],
                  Heure: extractDateDebut[1],
                  Vitesse: item['Vitesse maxi'],
                };
              }
            });

            rangeData.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'braking' };
                synthese.push(newItem);
              }
            });

            await KPDCXlsx(
              rangeData,
              HARSH_BRAKING,
              `${pathFile}-${titleDate}.xlsx`,
              column
            );
          } else {
            console.log(
              `no data found in ${DETAIL_TRAJET_FLOTTE} ${HARSH_BRAKING}`
            );
          }
        });
      })
      .then(async () => {
        await getRepportData(
          ADMIN_GLOBELEQ,
          STATIONNEMENT_ON_OFF,
          KPDC,
          firstHourDay,
          lastHourDay,
          CONTACT_ON
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            const column = res.excelColum;

            if (column.length > 0) {
              //add Jours property at the begining of the collunm
              column.unshift({ key: 'Jours' });

              column.splice(1, 2, { key: 'Noms des conducteurs' });
              column.splice(2, 3, { key: 'Vehicule' });
              column.splice(3, 4, { key: 'Nombre de recurrence' });
              column.splice(4, 5, { key: 'Exception' });
              column.splice(5, 6, { key: 'Emplacements' });
              column.splice(7, 8, { key: 'Dates' });
              column.splice(8, 9, { key: 'Heure' });
            }

            const rangeData = data.map((item) => {
              if (item) {
                const dat = item['Début'] ? item['Début'].text : '';

                const extractDateDebut = dat ? dat.split(' ') : '';

                const day = getStringDay(extractDateDebut);

                return {
                  Jours: day,
                  'Noms des conducteurs': item.Conducteur,
                  Vehicule: item.Grouping,
                  'Nombre de recurrence': 1,
                  Exception: 'arret moteur en marche',
                  Emplacements: item.Lieu,
                  Dates: extractDateDebut[0],
                  Heure: extractDateDebut[1],
                };
              }
            });

            rangeData.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'arret' };
                synthese.push(newItem);
              }
            });

            await KPDCXlsx(
              rangeData,
              ARRET_MOTEUR,
              `${pathFile}-${titleDate}.xlsx`,
              column
            );
          } else {
            console.log(
              `no data found in ${STATIONNEMENT_ON_OFF} ${CONTACT_ON}`
            );
          }
        });
      })

      .then(async () => {
        await getRepportData(
          ADMIN_GLOBELEQ,
          EXCES_DE_VITESSE_FLOTTE,
          KPDC,
          firstHourDay,
          lastHourDay,
          EXCES_VITESSE_FLOTTE_KPDC
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            const column = res.excelColum;

            if (column.length > 0) {
              //add Jours property at the begining of the collunm
              column.unshift({ key: 'Jours' });

              column.splice(1, 2, { key: 'Noms des conducteurs' });
              column.splice(2, 3, { key: 'Vehicule' });
              column.splice(3, 4, { key: 'Nombre de recurrence' });
              column.splice(4, 5, { key: 'Exception' });
              column.splice(5, 6, { key: 'Emplacements' });
              column.splice(7, 8, { key: 'Dates' });
              column.splice(8, 9, { key: 'Heure' });
            }

            const rangeData = data.map((item) => {
              if (item) {
                const dat = item['Début'] ? item['Début'].text : '';

                const extractDateDebut = dat ? dat.split(' ') : '';

                const day = getStringDay(extractDateDebut);

                return {
                  Jours: day,
                  'Noms des conducteurs': item.Conducteur,
                  Vehicule: item.Grouping,
                  'Nombre de recurrence': 1,
                  Exception: 'speeding',
                  Emplacements: item.Lieu,
                  Dates: extractDateDebut[0],
                  Heure: extractDateDebut[1],
                };
              }
            });

            rangeData.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'speeding' };
                synthese.push(newItem);
              }
            });

            await KPDCXlsx(
              rangeData,
              EXCES_VITESSE_FLOTTE_KPDC,
              `${pathFile}-${titleDate}.xlsx`,
              column
            );
          } else {
            console.log(
              `no data found in ${EXCES_DE_VITESSE_FLOTTE} ${EXCES_VITESSE_FLOTTE_KPDC}`
            );
          }
        });
      })
      .then(async () => {
        await generateDashbordKPDC(
          synthese,
          DASHBORD,
          `${pathFile}-${titleDate}.xlsx`
        );
      })
      .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(
              sender,
              receivers,
              pass,
              RAPPORT_HEBDOMADAIRE_KPDC_KRIBI,
              `${ACTIVITY_REPORT_SUBJECT_MAIL_KPDC_WEEK}`,
              `${RAPPORT_HEBDOMADAIRE_KPDC_KRIBI}.xlsx`,
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
            deleteFile(
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
          }, 30000);
        }
      })
      .catch((err) => console.log(err));
  } catch (err) {
    console.error(err);
  }
}

async function generateMonthlyRepportKPDC() {
  try {
    const synthese = [];
    const sender = await Senders(KPDC, 'E');
    const receivers = await Receivers(KPDC, 'D');
    //const sender = 'rapport.sav@camtrack.net';
    //const receivers = ['frankyshiti737@gmail.com,franky.shity@camtrack.net'];
    const fistAndLastHourDay = getFirstAndLastDayMonth();
    const firstHourDay = fistAndLastHourDay.firstDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastDayTimestamp;

    //const firstHourDay = '1731625200';
    //const lastHourDay = '1732143599';
    const titleDate = fistAndLastHourDay.dateTitle;
    const pathFile = 'rapport/kpdc/RAPPORT-MENSUEL-KPDC-KRIBI';

    await getRepportData(
      ADMIN_GLOBELEQ,
      DETAIL_TRAJET_FLOTTE,
      KPDC,
      firstHourDay,
      lastHourDay,
      TRAJET_FLOTTE_KPDC
    )
      .then(async (res) => {
        const objLenth = res?.obj.length;
        if (objLenth > 0) {
          const data = res.obj;
          const column = res.excelColum;

          /* range columns values to get needed element (Jours,Conducteur,Vehicule,Utilisation vehicule,Distance,
          heure de depart,lieu de depart,heure d'arriver,lieu d'ariver) */
          if (column.length > 0) {
            // remove the Grouping property at the begining of array
            column.shift();

            //remove the Arrets property at the last position of array
            column.pop();

            //add Jours property at the begining of the collunm
            column.unshift({ key: 'Jours' });

            //remove debut,fin,duree,ralentie moteur,Vitesse moyenne,Arrets properties
            column.splice(1, 2, { key: 'Conducteur' });
            column.splice(2, 3, { key: 'Vehicule' });
            column.splice(3, 4, { key: 'Utilisation Vehicule' });
            column.splice(4, 5, { key: 'Distance' });
            column.splice(5, 6, { key: 'Heure de depart' });
            column.splice(6, 7, { key: 'Lieu de depart' });
            column.splice(7, 8, { key: 'Heure d arriver' });
            column.splice(8, 9, { key: 'Lieu d arriver' });
          }

          const rangeData = data.map((item) => {
            if (item) {
              const extractDateDebut = item['Début']
                ? item['Début'].text.split(' ')[0]
                : '';

              const day = getStringDay(extractDateDebut);

              return {
                Jours: day,
                Conducteur: item.Conducteur,
                Vehicule: item.Grouping,
                'Utilisation Vehicule': item['Durée'],
                Distance: item.Distance,
                'Heure de depart': item['Début'],
                'Lieu de depart': item['Lieu de Départ'],
                'Heure d arriver': item.Fin,
                'Lieu d arriver': item["Lieu d'arrivée"],
              };
            }
          });

          rangeData.map((item) => {
            if (item) {
              const newItem = { ...item, template: 'trajet' };
              synthese.push(newItem);
            }
          });

          await KPDCXlsx(
            rangeData,
            TRAJET_FLOTTE_KPDC,
            `${pathFile}-${titleDate}.xlsx`,
            column
          );
        } else {
          console.log(
            `no data found in ${DETAIL_TRAJET_FLOTTE} ${TRAJET_FLOTTE_KPDC}`
          );
        }
      })

      .then(async () => {
        await getRepportData(
          ADMIN_GLOBELEQ,
          RAPPORT_GLOBELEQ_NOUVEAU_MODULE_KPDC,
          KPDC,
          firstHourDay,
          lastHourDay,
          HARSH_BRAKING
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            const column = res.excelColum;
            if (column.length > 0) {
              //add Jours property at the begining of the collunm
              column.unshift({ key: 'Jours' });

              column.splice(1, 2, { key: 'Noms des conducteurs' });
              column.splice(2, 3, { key: 'Vehicule' });
              column.splice(3, 4, { key: 'Nombre de recurrence' });
              column.splice(4, 5, { key: 'Emplacements' });
              column.splice(5, 6, { key: 'Dates' });
              column.splice(6, 7, { key: 'Heure' });
              column.splice(7, 8, { key: 'Vitesse' });
            }

            const rangeData = data.map((item) => {
              if (item) {
                const dat = item['Début'] ? item['Début'].text : '';

                const extractDateDebut = dat ? dat.split(' ') : '';

                const day = getStringDay(extractDateDebut);

                return {
                  Jours: day,
                  'Noms des conducteurs': item.Conducteur,
                  Vehicule: item.Grouping,
                  'Nombre de recurrence': item['NBRE DE FREINAGE'],
                  Emplacements: item['Emplacement initial'],
                  Dates: extractDateDebut[0],
                  Heure: extractDateDebut[1],
                  Vitesse: item['Vitesse maxi'],
                };
              }
            });

            rangeData.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'braking' };
                synthese.push(newItem);
              }
            });

            await KPDCXlsx(
              rangeData,
              HARSH_BRAKING,
              `${pathFile}-${titleDate}.xlsx`,
              column
            );
          } else {
            console.log(
              `no data found in ${DETAIL_TRAJET_FLOTTE} ${HARSH_BRAKING}`
            );
          }
        });
      })
      .then(async () => {
        await getRepportData(
          ADMIN_GLOBELEQ,
          STATIONNEMENT_ON_OFF,
          KPDC,
          firstHourDay,
          lastHourDay,
          CONTACT_ON
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            const column = res.excelColum;

            if (column.length > 0) {
              //add Jours property at the begining of the collunm
              column.unshift({ key: 'Jours' });

              column.splice(1, 2, { key: 'Noms des conducteurs' });
              column.splice(2, 3, { key: 'Vehicule' });
              column.splice(3, 4, { key: 'Nombre de recurrence' });
              column.splice(4, 5, { key: 'Exception' });
              column.splice(5, 6, { key: 'Emplacements' });
              column.splice(7, 8, { key: 'Dates' });
              column.splice(8, 9, { key: 'Heure' });
            }

            const rangeData = data.map((item) => {
              if (item) {
                const dat = item['Début'] ? item['Début'].text : '';

                const extractDateDebut = dat ? dat.split(' ') : '';

                const day = getStringDay(extractDateDebut);

                return {
                  Jours: day,
                  'Noms des conducteurs': item.Conducteur,
                  Vehicule: item.Grouping,
                  'Nombre de recurrence': 1,
                  Exception: 'arret moteur en marche',
                  Emplacements: item.Lieu,
                  Dates: extractDateDebut[0],
                  Heure: extractDateDebut[1],
                };
              }
            });

            rangeData.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'arret' };
                synthese.push(newItem);
              }
            });

            await KPDCXlsx(
              rangeData,
              ARRET_MOTEUR,
              `${pathFile}-${titleDate}.xlsx`,
              column
            );
          } else {
            console.log(
              `no data found in ${STATIONNEMENT_ON_OFF} ${CONTACT_ON}`
            );
          }
        });
      })

      .then(async () => {
        await getRepportData(
          ADMIN_GLOBELEQ,
          EXCES_DE_VITESSE_FLOTTE,
          KPDC,
          firstHourDay,
          lastHourDay,
          EXCES_VITESSE_FLOTTE_KPDC
        ).then(async (res) => {
          const objLenth = res?.obj.length;
          if (objLenth > 0) {
            const data = res.obj;
            const column = res.excelColum;

            if (column.length > 0) {
              //add Jours property at the begining of the collunm
              column.unshift({ key: 'Jours' });

              column.splice(1, 2, { key: 'Noms des conducteurs' });
              column.splice(2, 3, { key: 'Vehicule' });
              column.splice(3, 4, { key: 'Nombre de recurrence' });
              column.splice(4, 5, { key: 'Exception' });
              column.splice(5, 6, { key: 'Emplacements' });
              column.splice(7, 8, { key: 'Dates' });
              column.splice(8, 9, { key: 'Heure' });
            }

            const rangeData = data.map((item) => {
              if (item) {
                const dat = item['Début'] ? item['Début'].text : '';

                const extractDateDebut = dat ? dat.split(' ') : '';

                const day = getStringDay(extractDateDebut);

                return {
                  Jours: day,
                  'Noms des conducteurs': item.Conducteur,
                  Vehicule: item.Grouping,
                  'Nombre de recurrence': 1,
                  Exception: 'speeding',
                  Emplacements: item.Lieu,
                  Dates: extractDateDebut[0],
                  Heure: extractDateDebut[1],
                };
              }
            });

            rangeData.map((item) => {
              if (item) {
                const newItem = { ...item, template: 'speeding' };
                synthese.push(newItem);
              }
            });

            await KPDCXlsx(
              rangeData,
              EXCES_VITESSE_FLOTTE_KPDC,
              `${pathFile}-${titleDate}.xlsx`,
              column
            );
          } else {
            console.log(
              `no data found in ${EXCES_DE_VITESSE_FLOTTE} ${EXCES_VITESSE_FLOTTE_KPDC}`
            );
          }
        });
      })
      .then(async () => {
        await generateDashbordKPDC(
          synthese,
          DASHBORD,
          `${pathFile}-${titleDate}.xlsx`
        );
      })
      .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(
              sender,
              receivers,
              pass,
              RAPPORT_MENSUEL_KPDC_KRIBI,
              `${ACTIVITY_REPORT_SUBJECT_MAIL_KPDC_MONTH}`,
              `${RAPPORT_MENSUEL_KPDC_KRIBI}.xlsx`,
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
            deleteFile(
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
          }, 30000);
        }
      })
      .catch((err) => console.log(err));
  } catch (err) {
    console.error(err);
  }
}

async function generateAllRepportKPDC() {
  //await generateHebdoRepportKPDC();
  //await generateMonthlyRepportKPDC();
  await generateHebdoRepportKPDC();
  cron.schedule(
    '30 04 * * Monday',
    async () => {
      await generateHebdoRepportKPDC();
    },
    {
      scheduled: true,
      timezone: 'Africa/Lagos',
    }
  );

  cron.schedule(
    '30 6 3 1,2,3,4,5,6,7,8,9,10,11,12 *',
    async () => {
      await generateMonthlyRepportKPDC();
    },
    {
      scheduled: true,
      timezone: 'Africa/Lagos',
    }
  );
}

module.exports = { generateAllRepportKPDC };
