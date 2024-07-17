const path = require('path');
const cron = require('node-cron');
const _ = require('lodash');
const { getRepportData } = require('../models/models');
const { getFistAndLastHourDay, } = require('../utils/getFirstAndLastHourDay');
const { getFirstAndLastDayMonth } = require('../utils/getFistDayAndLastDayMonth');
const { guinnessXlsx } = require('../utils/genrateXlsx');
const { deleteFile } = require('../utils/deleteFile')
const {changePropertiesDateTOLocal}=require('../utils/convertDatePropertiesToLocaltime')
const { Receivers } = require('../storage/mailReceivers.storage');
const { Senders } = require('../storage/mailSender.storage')
const { sendMail } = require('../utils/sendMail');
const {RAPPORT_GUINNESS,EXCES_DE_VITESSE}=require('../constants/subGroups')
const { GUINNESS } = require('../constants/clients');
const { ADMIN_SABC,ADMIN_ADDAX } = require('../constants/ressourcesClient');
const {ACTIVITY_REPORT_SUBJECT_MAIL_GUINNESS} = require('../constants/mailSubjects');
const { RAPPORT_JOURNALIER_GUINESS,EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM,RAPPORT_MENSUEL_GUINESS } = require('../constants/template');

const pass=process.env.PASS_MAIL_FRANCK;

async function generateDaylyRepportGuinness() {
    const sender = await Senders(GUINNESS, 'E');
    const receivers = await Receivers(GUINNESS, 'D');
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
                    await guinnessXlsx(data,RAPPORT_GUINNESS, `${pathFile}-${titleDate}.xlsx`, column);
                } else {
                    console.log(`no data found in ${RAPPORT_JOURNALIER_GUINESS} ${RAPPORT_GUINNESS}`);
                }
            }).then(()=>{
            if (sender && receivers) {
              setTimeout(() => {
                sendMail(sender,receivers,pass, RAPPORT_JOURNALIER_GUINESS, `${ACTIVITY_REPORT_SUBJECT_MAIL_GUINNESS}`,`${RAPPORT_JOURNALIER_GUINESS}.xlsx`, path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
                deleteFile(path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
              }, 30000)
            } 
          }) .catch(err => console.log(err))
    } catch (err) {
        console.error(err)
    }
}


async function generateMonthlyRepportGuinness() {
    const sender = await Senders(GUINNESS,'E');
    const receivers = await Receivers(GUINNESS,'D');
    const firstDayLastDayMonth = getFirstAndLastDayMonth();
    const firstDayMonth = firstDayLastDayMonth.firstDayTimestamp;
    const lastDayMonth = firstDayLastDayMonth.lastDayTimestamp;
    const titleDate = firstDayLastDayMonth.dateTitle
    const pathFile = "rapport/Guinness/RAPPORT-MENSUEL-GUINNESS";
    try {
        await getRepportData(ADMIN_ADDAX,EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM,GUINNESS,firstDayMonth,lastDayMonth,EXCES_DE_VITESSE )
            .then(async (res) => {
                const objLenth = res?.obj.length;
                if (objLenth > 0) {
                    const data = res.obj;
                    const column = res.excelColum;
                    const fillterCol= column.filter((item)=>item.key !== 'Conducteur' );

                    const filter = data.filter((item) => {
                        const date=item['Durée'].split(':');
                        const sec =parseInt(date[2]);
                        const min= parseInt(date[1]);
                        return sec>=10 || min>0 ;
                    })

                    await guinnessXlsx(filter, EXCES_DE_VITESSE, `${pathFile}-${titleDate}.xlsx`,fillterCol);
                } else {
                    console.log(`no data found in ${RAPPORT_MENSUEL_GUINESS} ${EXCES_DE_VITESSE}`);
                }
            }).then(()=>{
            if (sender && receivers) {
              setTimeout(() => {
                sendMail(sender,receivers,pass, RAPPORT_MENSUEL_GUINESS, `${ACTIVITY_REPORT_SUBJECT_MAIL_GUINNESS}`,`${RAPPORT_MENSUEL_GUINESS}.xlsx`, path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
                deleteFile(path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
              }, 30000)
            } 
          }) .catch(err => console.log(err))
    } catch (err) {
        console.error(err)
    }
}

async function generateAllRepportGuinness() {
    //await generateMonthlyRepportGuinness()
    //await generateDaylyRepportGuinness();
    cron.schedule('30 6 * * *', async () => {
        await generateDaylyRepportGuinness()
      }, {
        scheduled: true,
        timezone: "Africa/Lagos"
    });

    cron.schedule('30 6 1 1,2,3,4,5,6,7,8,9,10,11,12 *', async () => {
        await generateMonthlyRepportGuinness()
      }, {
        scheduled: true,
        timezone: "Africa/Lagos"
      });
}

module.exports = { generateAllRepportGuinness }