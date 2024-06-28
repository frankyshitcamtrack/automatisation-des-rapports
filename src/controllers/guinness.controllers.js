const path = require('path');
const cron = require('node-cron');
const _ = require('lodash');
const { getRepportData } = require('../models/models');
const { getFistAndLastHourDay, } = require('../utils/getFirstAndLastHourDay');
const { getFirstAndLastDayMonth } = require('../utils/getFistDayAndLastDayMonth');
const { guinnessXlsx } = require('../utils/genrateXlsx');
const { deleteFile } = require('../utils/deleteFile')
const { Receivers } = require('../storage/mailReceivers.storage');
const { Senders } = require('../storage/mailSender.storage')
const { sendMail } = require('../utils/sendMail');
const {RAPPORT_GUINNESS}=require('../constants/subGroups')
const { GUINNESS } = require('../constants/clients');
const { ADMIN_SABC,ADMIN_ADDAX } = require('../constants/ressourcesClient');
//const { } = require('../constants/mailSubjects');
const { RAPPORT_JOURNALIER_GUINESS,RAPPORT_MENSUEL_GUINESS } = require('../constants/template');
const pass = process.env.PASS_MAIL_YAMDEU;

async function generateDaylyRepportGuinness() {
    // const sender = await Senders(ADDAX_PETROLEUM, 'E');
    //const receivers = await Receivers(ADDAX_PETROLEUM, 'D');
    const fistAndLastHourDay = getFistAndLastHourDay();
    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;
    const titleDate = fistAndLastHourDay.dateTitle;
    const pathFile = "rapport/Guinness/RAPPORT-GUINNESS";
    try {
        await getRepportData(ADMIN_SABC, RAPPORT_JOURNALIER_GUINESS, GUINNESS, firstHourDay, lastHourDay, RAPPORT_GUINNESS)
            .then(async (res) => {
                const objLenth = res?.obj.length;
                if (objLenth > 0) {
                    const data = res.obj;
                    const column = res.excelColum;
                    await guinnessXlsx(data, RAPPORT_GUINNESS, `${pathFile}-${titleDate}.xlsx`, column);
                } else {
                    console.log(`no data found in ${RAPPORT_JOURNALIER_GUINESS} ${RAPPORT_GUINNESS}`);
                }
            })/* .then(()=>{
            if (sender && receivers) {
              setTimeout(() => {
                sendMail(sender,receivers,pass, RAPPORT_JOURNALIER_GUINESS, `${EXCEPTION_REPORT_SUBJECT_MAIL}`,`${RAPPORT_JOURNALIER_GUINESS}.xlsx`, path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
                deleteFile(path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
              }, 30000)
            } 
          }) */ .catch(err => console.log(err))
    } catch (err) {
        console.error(err)
    }
}


async function generateMonthlyRepportGuinness() {
    // const sender = await Senders(ADDAX_PETROLEUM, 'E');
    //const receivers = await Receivers(ADDAX_PETROLEUM, 'D');
    const firstDayLastDayMonth = getFirstAndLastDayMonth();
    const firstDayMonth = firstDayLastDayMonth.firstDayTimestamp;
    const lastDayMonth = firstDayLastDayMonth.lastDayTimestamp;
    const titleDate = firstDayLastDayMonth.dateTitle
    const pathFile = "rapport/Guinness/RAPPORT-GUINNESS";
    try {
        await getRepportData(ADMIN_ADDAX, RAPPORT_JOURNALIER_GUINESS, GUINNESS, firstHourDay, lastHourDay, RAPPORT_GUINNESS)
            .then(async (res) => {
                const objLenth = res?.obj.length;
                if (objLenth > 0) {
                    const data = res.obj;
                    const column = res.excelColum;
                    await guinnessXlsx(data, RAPPORT_GUINNESS, `${pathFile}-${titleDate}.xlsx`, column);
                } else {
                    console.log(`no data found in ${RAPPORT_JOURNALIER_GUINESS} ${RAPPORT_GUINNESS}`);
                }
            })/* .then(()=>{
            if (sender && receivers) {
              setTimeout(() => {
                sendMail(sender,receivers,pass, RAPPORT_JOURNALIER_GUINESS, `${EXCEPTION_REPORT_SUBJECT_MAIL}`,`${RAPPORT_JOURNALIER_GUINESS}.xlsx`, path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
                deleteFile(path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
              }, 30000)
            } 
          }) */ .catch(err => console.log(err))
    } catch (err) {
        console.error(err)
    }
}

async function generateAllRepportGuinness() {
    await generateDaylyRepportGuinness()
}


module.exports = { generateAllRepportGuinness }