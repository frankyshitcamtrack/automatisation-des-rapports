const path = require('path');
const _ = require('lodash');
const cron = require('node-cron');
const { Receivers } = require('../storage/mailReceivers.storage');
const { Senders } = require('../storage/mailSender.storage');
const { sendMail } = require('../utils/sendMail');
const { deleteFile } = require('../utils/deleteFile');
const { getCimencamData } = require('../models/cimencam.models');
const { cimencamXlsx } = require('../utils/genrateXlsx');
const { getFistAndLastHourDay } = require('../utils/getFirstAndLastHourDay');
const { dateInYyyyMmDdHhMmSs } = require('../utils/dateFormat');
const { CIMENCAM } = require('../constants/clients');
const { RAPPORT_CIMENCAM } = require('../constants/subGroups');
const {
  ACTIVITY_REPORT_SUBJECT_MAIL_CIMENCAM,
} = require('../constants/mailSubjects');
const { RAPPORT_JOURNALIER_CIMENCAM } = require('../constants/template');

//const pass = process.env.PASS_MAIL_GHISLAIN;

const pass = process.env.PASS_MAIL_SAV;

async function generateDaylyRepportCimencam() {
  const sender = await Senders(CIMENCAM, 'E');
  const receivers = await Receivers(CIMENCAM, 'D');
  const fistAndLastHourDay = getFistAndLastHourDay();
  const titleDate = fistAndLastHourDay.dateTitle;
  //const sender ='ghislain.kamgang@camtrack.net'

  /*  const receivers =[
      { name: 'frank', address: 'franky.shity@camtrack.net' },
      { name: 'ghisl', address: 'ghislain.kamgang@camtrack.net'}, 
    ]  
     */

  const pathFile = 'rapport/Cimencam/RAPPORT-CIMENCAM';

  try {
    await getCimencamData()
      .then((res) => {
        const data = res;
        if (data) {
          const rangeData = data.rangeData;
          const column = data.header;
          cimencamXlsx(
            rangeData,
            RAPPORT_CIMENCAM,
            `${pathFile}-${titleDate}.xlsx`,
            column,
            titleDate
          );
        } else {
          console.log(`no data found in ${RAPPORT_CIMENCAM}`);
        }
      })
      .then(() => {
        if (sender && receivers) {
          setTimeout(() => {
            sendMail(
              sender,
              receivers,
              pass,
              `${RAPPORT_JOURNALIER_CIMENCAM}-${titleDate}`,
              `${ACTIVITY_REPORT_SUBJECT_MAIL_CIMENCAM}`,
              `${RAPPORT_JOURNALIER_CIMENCAM}.xlsx`,
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
            deleteFile(
              path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`)
            );
          }, 30000);
        }
      });
  } catch (err) {
    console.error(err);
  }
}

async function generateAllRepportCimencam() {
  //await generateDaylyRepportCimencam();
  cron.schedule(
    '30 6 * * *',
    async () => {
      await generateDaylyRepportCimencam();
    },
    {
      scheduled: true,
      timezone: 'Africa/Lagos',
    }
  );
}

module.exports = { generateAllRepportCimencam };
