const path = require('path');
const cron = require('node-cron');
const {getRepportData} = require('../models/models');
const { getFistAndLastHourDay} = require('../utils/getFirstAndLastHourDay');
const {perencoXlsx} = require('../utils/genrateXlsx');
const { Receivers } = require('../storage/mailReceivers.storage');
const {Senders}=require('../storage/mailSender.storage')
const { sendMail } = require('../utils/sendMail');
const {PERENCO}=require('../constants/clients');
const {ADMIN_PERENCO}=require('../constants/ressourcesClient');
const {RAPPORT_ACTIVITE_FLOTTE_PERENCO}=require('../constants/template');
const { SPEEDING,ECO_DRIVING,DETAIL_TRAJET,CONDUITE_DE_NUIT,EXCES_DE_VITESSE,EXCES_DE_VITESSE_BASE_PERENCO,EXCES_DE_VITESSE_NAT3,EXCES_DE_VITESSE_VILLE,EXCES_DE_VITESSE_HORS_VILLE}=require('../constants/subGroups');


async function generateDaylyRepportPerenco() {
  /*const sender = await Senders(PERENCO, 'E');
    const receivers = await Receivers(PERENCO, 'D'); */
    const fistAndLastHourDay = getFistAndLastHourDay();
    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;
    const titleDate = fistAndLastHourDay.dateTitle;
    const pathFile = "rapport/Perenco/RAPPORT-ACTIVITE-FLOTTE-PERENCO";
  
    await getRepportData(ADMIN_PERENCO,RAPPORT_ACTIVITE_FLOTTE_PERENCO,PERENCO,firstHourDay,lastHourDay,ECO_DRIVING)
    .then(async (res)=>{
      const objLenth=res?.obj.length;
      if(objLenth>0){
        const data= res.obj;
        const column=res.excelColum;
        await perencoXlsx(data,ECO_DRIVING,`${pathFile}-${titleDate}.xlsx`,column);
      }else{
        console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${ECO_DRIVING}`);
      }
    })
  
   .then(async ()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_ACTIVITE_FLOTTE_PERENCO,PERENCO,firstHourDay,lastHourDay,DETAIL_TRAJET)
      .then(async (res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          await perencoXlsx(data,DETAIL_TRAJET,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${DETAIL_TRAJET}`);
        }
      }) 
      .catch(err => console.log(err))
    })
  
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_ACTIVITE_FLOTTE_PERENCO,PERENCO,firstHourDay,lastHourDay,CONDUITE_DE_NUIT)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          await perencoXlsx(data,CONDUITE_DE_NUIT,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${CONDUITE_DE_NUIT}`);
        }
      }).catch(err => console.log(err))
    }) 
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_ACTIVITE_FLOTTE_PERENCO,PERENCO,firstHourDay,lastHourDay,EXCES_DE_VITESSE_NAT3)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          await perencoXlsx(data,EXCES_DE_VITESSE_NAT3,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${EXCES_DE_VITESSE_NAT3}`);
        }
      }).catch(err => console.log(err))
    })
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_ACTIVITE_FLOTTE_PERENCO,PERENCO,firstHourDay,lastHourDay,EXCES_DE_VITESSE_HORS_VILLE)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          await perencoXlsx(data,EXCES_DE_VITESSE_HORS_VILLE,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${EXCES_DE_VITESSE_HORS_VILLE}`);
        }
      }).catch(err => console.log(err))
    })
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_ACTIVITE_FLOTTE_PERENCO,PERENCO,firstHourDay,lastHourDay,EXCES_DE_VITESSE_BASE_PERENCO)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          await perencoXlsx(data,EXCES_DE_VITESSE_BASE_PERENCO,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${EXCES_DE_VITESSE_BASE_PERENCO}`);
        }
      }).catch(err => console.log(err))
    })
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_ACTIVITE_FLOTTE_PERENCO,PERENCO,firstHourDay,lastHourDay,EXCES_DE_VITESSE_VILLE)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          await perencoXlsx(data,EXCES_DE_VITESSE_VILLE,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${EXCES_DE_VITESSE_VILLE}`);
        }
      }).catch(err => console.log(err))
    })
/*   
  .then(()=>{
      if (sender && receivers) {
        setTimeout(() => {
          sendMail(sender,test,pass, EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM, `${EXCEPTION_REPORT_SUBJECT_MAIL}`,`${EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM}.xlsx`, path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
        }, 30000)
      } 
    })  */
   .catch(err => console.log(err))
}




  module.exports={generateDaylyRepportPerenco}