const path = require('path');
const cron = require('node-cron');
const _ = require('lodash');
const { getRepportData } = require('../models/models');
const {
  getFistAndLastHourActualDay,
} = require('../utils/getFirstAndLastHourDay');
const { generateComAlios } = require('../utils/genrateXlsx');
const { deleteFile } = require('../utils/deleteFile');
const {
  changePropertiesDateTOLocal,
} = require('../utils/convertDatePropertiesToLocaltime');
const { Receivers } = require('../storage/mailReceivers.storage');
const { Senders } = require('../storage/mailSender.storage');
const { sendMail } = require('../utils/sendMail');

/* const {
  LIST_VEHICULES,
} = require('../constants/subGroups'); */

const { ALIOS } = require('../constants/clients');
const { ADMIN_CLIENT } = require('../constants/ressourcesClient');
const { LIST_VEHICULES } = require('../constants/template');
const { LIST_VEHICULES_GROUP } = require('../constants/subGroups');
const {
  ACTIVITY_REPORT_SUBJECT_MAIL_ALIOS,
} = require('../constants/mailSubjects');

//const pass=process.env.PASS_MAIL_FRANCK;
const pass = process.env.PASS_MAIL_SAV;

async function generateDaylyAlios() {
  const sender = await Senders(ALIOS, 'E');
  const receivers = await Receivers(ALIOS, 'D');

  ///const sender = 'rapport.sav@camtrack.net';
  ///const receivers = ['franky.shity@camtrack.net'];

  const fistAndLastHourDay = getFistAndLastHourActualDay();
  const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
  const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;

  //const firstHourDay = "1749769200";
  //const lastHourDay = "1749855540";

  const titleDate = fistAndLastHourDay.dateTitle;
  const pathFile = 'rapport/alios/COMMUNICATION-VEHICULE';
  try {
    await getRepportData(
      ADMIN_CLIENT,
      LIST_VEHICULES,
      ALIOS,
      firstHourDay,
      lastHourDay,
      LIST_VEHICULES_GROUP
    )
      .then(async (res) => {
        const objLenth = res?.obj.length;
        if (objLenth > 0) {
          const data = res.obj;
          const column = res.excelColum;
          column.push({ key: 'Communication' });

          const newDataWithComStatus = data.map((item) => {
            const messageDate = item['Dernier message'].text?.split(' ')[0];
            if (messageDate !== titleDate) {
              return { ...item, Communication: 'No Communication' };
            } else {
              return { ...item, Communication: 'OK' };
            }
          });

          await generateComAlios(
            newDataWithComStatus,
            LIST_VEHICULES,
            `${pathFile}-${titleDate}.xlsx`,
            column
          );
        } else {
          console.log(`no data found in ${LIST_VEHICULES} ${LIST_VEHICULES}`);
        }
      })
      .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(
              sender,
              receivers,
              pass,
              LIST_VEHICULES,
              `${ACTIVITY_REPORT_SUBJECT_MAIL_ALIOS}`,
              `${LIST_VEHICULES}.xlsx`,
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

async function generateAllAliosRepport() {
  //await generateDaylyAlios();
  cron.schedule(
    '30 6 * * *',
    async () => {
      await generateDaylyAlios();
    },
    {
      scheduled: true,
      timezone: 'Africa/Lagos',
    }
  );
}

module.exports = { generateAllAliosRepport };
