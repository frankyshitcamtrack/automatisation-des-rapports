const path = require('path');
const cron = require('node-cron');
const {getRepportData, getRepportDataUnit } = require('../models/models');
const { getFirstAndLastDayMonth } = require('../utils/getFistDayAndLastDayMonth');
const { getFistAndLastHourDay, getFistAndLastHourDay22H06H, getfirstAndLastHourDay48H } = require('../utils/getFirstAndLastHourDay');
const { generateSyntheseSheetAddax, convertJsonToExcel } = require('../utils/genrateXlsx');
const { getDate } = require('../utils/getDateProps');
const { filterData48h } = require('../utils/filterDataBetween22H6H');
const { Receivers } = require('../storage/mailReceivers.storage');
const { Senders } = require('../storage/mailSender.storage')
const { sendMail } = require('../utils/sendMail');
const {ADDAX_PETROLEUM}=require('../constants/clients');
const {ADMIN_ADDAX}=require('../constants/ressourcesClient');
const {ACTIVITY_REPORT_OF_ADDAX_PETROLEUM,LIST_OF_VEHICLES_NOT_AT_ADDAX_PARKING,EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM} =require('../constants/template');
const {SYNTHESE,ACTIVITY_CARS,EXCEPTIONS,SOMMAIRE,NOT_AT_PARKED,ECO_CONDUITE,EXCES_DE_VITESSE,EXCESSIVE_IDLE}=require('../constants/subGroups');
const {ADDAX_NOT_AT_PARKING_SUBJECT_MAIL,EXCEPTION_REPORT_SUBJECT_MAIL,ACTIVITY_REPORT_SUBJECT_MAIL}=require('../constants/mailSubjects');

const test =[
  { name: 'frank', address: 'franky.shity@camtrack.net' },
  { name: 'magnouvel', address: 'magnouvel.mekontso@camtrack.net' },
] 

const pass = process.env.PASS_MAIL;


async function generateAddaxDaylyRepport() {
  const sender = await Senders(ADDAX_PETROLEUM, 'E');
  const receivers = await Receivers(ADDAX_PETROLEUM, 'D');
  const fistAndLastHourDay = getFistAndLastHourDay();
  const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
  const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;
  const titleDate = fistAndLastHourDay.dateTitle;
  const pathFile = "rapport/Adax/EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM";

  await getRepportData(ADMIN_ADDAX,EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM,ADDAX_PETROLEUM,firstHourDay,lastHourDay,EXCESSIVE_IDLE)
  .then(async (res)=>{
    const objLenth=res?.obj.length;
    if(objLenth>0){
      const data= res.obj;
      const column=res.excelColum;
      await convertJsonToExcel(data,EXCESSIVE_IDLE,`${pathFile}-${titleDate}.xlsx`,column);
    }else{
      console.log(`no data found in ${EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM} ${EXCESSIVE_IDLE}`);
    }
  })

  .then(async ()=>{
    await getRepportData(ADMIN_ADDAX,EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM,ADDAX_PETROLEUM,firstHourDay,lastHourDay,ECO_CONDUITE)
    .then(async (res)=>{
      const objLenth=res?.obj.length;
      if(objLenth>0){
        const data= res.obj;
        const column=res.excelColum;
        await convertJsonToExcel(data,ECO_CONDUITE,`${pathFile}-${titleDate}.xlsx`,column);
      }else{
        console.log(`no data found in ${EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM} ${ECO_CONDUITE}`);
      }
    }) 
    .catch(err => console.log(err))
  })

  .then(async()=>{
    await getRepportData(ADMIN_ADDAX,EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM,ADDAX_PETROLEUM,firstHourDay,lastHourDay,EXCES_DE_VITESSE)
    .then(async(res)=>{
      const objLenth=res?.obj.length;
      if(objLenth>0){
        const data= res.obj;
        const column=res.excelColum;
        await convertJsonToExcel(data,EXCES_DE_VITESSE,`${pathFile}-${titleDate}.xlsx`,column);
      }else{
        console.log(`no data found in ${EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM} ${EXCES_DE_VITESSE}`);
      }
    }).catch(err => console.log(err))
  })

.then(()=>{
    if (sender && receivers) {
      setTimeout(() => {
        sendMail(sender,test,pass, EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM, `${EXCEPTION_REPORT_SUBJECT_MAIL}`,`${EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM}.xlsx`, path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
      }, 30000)
    } 
  }) 
 .catch(err => console.log(err))
}


async function generateAddaxDaylyRepport22h06h() {
  const sender = await Senders(ADDAX_PETROLEUM, 'E');
  const receivers = await Receivers(ADDAX_PETROLEUM, 'D');
  const first22h6h = getFistAndLastHourDay22H06H();
  const firstHour = first22h6h.firstHourDayTimestamp06h;
  const lastHour = first22h6h.lastHourDayTimestamp22h;
  const titleDate = first22h6h.dateTitle;
  const pathFile="rapport/Adax/LIST-OF-VEHICLES-NOT-AT-ADDAX-PARKING";

 await getRepportData(ADMIN_ADDAX,LIST_OF_VEHICLES_NOT_AT_ADDAX_PARKING,ADDAX_PETROLEUM,firstHour,lastHour,NOT_AT_PARKED)
 .then(async (res)=>{
  if(res.obj.length>0){
    const data= res.obj;
    const column=res.excelColum;
    await convertJsonToExcel(data,NOT_AT_PARKED,`${pathFile}-${titleDate}.xlsx`,column);
  }else{
    console.log(`no data found in ${LIST_OF_VEHICLES_NOT_AT_ADDAX_PARKING} ${NOT_AT_PARKED}`);
  }
 })
.then(()=>{
  if (sender && receivers) {
    setTimeout(() => {
      sendMail(sender,test,pass, LIST_OF_VEHICLES_NOT_AT_ADDAX_PARKING,`${ADDAX_NOT_AT_PARKING_SUBJECT_MAIL}`,`${LIST_OF_VEHICLES_NOT_AT_ADDAX_PARKING}.xlsx`, path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
    }, 30000)
  }  
 }) 
 .catch(err => console.log(err))
}


async function generateAddaxMonthlyRepport() {
  const firstDayLastDayMonth = getFirstAndLastDayMonth();

  const firstDayMonth = firstDayLastDayMonth.firstDayTimestamp;
  const lastDayMonth = firstDayLastDayMonth.lastDayTimestamp;
  const titleDate = firstDayLastDayMonth.dateTitle
  const pathFile ="rapport/Adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM";


  getRepportData(ADMIN_ADDAX,ACTIVITY_REPORT_OF_ADDAX_PETROLEUM,ADDAX_PETROLEUM,firstDayMonth,lastDayMonth,SOMMAIRE)
  .then(async(res)=>{
    const objLenth=res.obj.length;
    if(objLenth>0){
      const data= res.obj;
      const column=res.excelColum;
      const sheetName="SOMMAIRE"
      await convertJsonToExcel(data,sheetName,`${pathFile }-${titleDate}.xlsx`,column,"008000");
    }else{
      console.log(`no data found in ${ACTIVITY_REPORT_OF_ADDAX_PETROLEUM} ${SOMMAIRE}`);
    }
  })

  .then(async()=>{
    await getRepportData(ADMIN_ADDAX,ACTIVITY_REPORT_OF_ADDAX_PETROLEUM, ADDAX_PETROLEUM, firstDayMonth, lastDayMonth,ACTIVITY_CARS)
    .then(async (res)=>{
      const objLenth=res.obj.length;
      if(objLenth>0){
        const data = res.obj;
        const column =res.excelColum;
        const sheetName="ACTIVITY CARS"
        await convertJsonToExcel(data,sheetName,`${pathFile }-${titleDate}.xlsx`,column,"ff0000");
      }else{
        console.log(`no data found in ${ACTIVITY_REPORT_OF_ADDAX_PETROLEUM} ${ACTIVITY_CARS}`);
      }
    }).catch(err => console.log(err))
  })

  .then(async()=>{
    await getRepportData(ADMIN_ADDAX,ACTIVITY_REPORT_OF_ADDAX_PETROLEUM,ADDAX_PETROLEUM,firstDayMonth,lastDayMonth,EXCEPTIONS)
    .then(async (res)=>{
      const objLenth=res.obj.length;
      if(objLenth>0){
        const data = res.obj;
        const column = res.excelColum;
        const sheetName="EXCEPTIONS";
        await convertJsonToExcel(data,sheetName,`${pathFile }-${titleDate}.xlsx`,column,"808080");
      }else{
        console.log(`no data found in ${ACTIVITY_REPORT_OF_ADDAX_PETROLEUM} ${EXCEPTIONS}`);
      }
    }).catch(err => console.log(err))
  })

  .then(()=>{
    AddaxMonthlyRepportSynthese();
  })
  .catch(err => console.log(err))
}



async function AddaxMonthlyRepportSynthese() {
  const sender = await Senders(ADDAX_PETROLEUM, 'E');
  const receivers = await Receivers(ADDAX_PETROLEUM, 'D');

  const firstDayLastDayMonth = getFirstAndLastDayMonth();
  const pathFile ='rapport/Adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM'

  const firstDayMonth = firstDayLastDayMonth.firstDayTimestamp;
  const lastDayMonth = firstDayLastDayMonth.lastDayTimestamp;
  const reportTitleDate = firstDayLastDayMonth.dateTitle

  const sommaireData = await getRepportData(ADMIN_ADDAX, ACTIVITY_REPORT_OF_ADDAX_PETROLEUM, ADDAX_PETROLEUM, firstDayMonth, lastDayMonth, SOMMAIRE);
  const syntheseData = await getRepportData(ADMIN_ADDAX,SYNTHESE, ADDAX_PETROLEUM, firstDayMonth, lastDayMonth, "Total number of vehicle/véhicle communicating");
  const speedingData = await getRepportDataUnit(ADMIN_ADDAX, EXCEPTION_REPORT_VEHICULES_ADDAX_PETROLEUM, ADDAX_PETROLEUM, firstDayMonth, lastDayMonth, EXCES_DE_VITESSE)

  let totalVehicle;
  let TotalVehiculCom;
  let totalVehicleUsed;
  let vehiculUsedPercent;
  let TotalKm;
  let avrKmDriven;
  let numberSpeedingVehicle;
  let vitesseMax;

  if (sommaireData) {
    const sommaireArr = sommaireData.obj;
    const total = sommaireArr.filter(item => item['Grouping'] === 'Total');
    const sommaireArrWithoutTotal = sommaireArr.filter(item => item['Grouping'] !== 'Total');

    const vehicleUsed = sommaireArrWithoutTotal.filter(item => item['Heures moteur'] !== '00:00:00');
    totalVehicleUsed = vehicleUsed.length;

    const kmArr = total.map(item => { return parseInt(item['Kilométrage']) })
    TotalKm = kmArr.reduce((a, b) => a + b);

    avrKmDriven = Math.floor(TotalKm / totalVehicleUsed);

    const vitesseMaxArr = total.map(item => { return parseInt(item['Vitesse maxi']) })
    vitesseMax = vitesseMaxArr.reduce((a, b) => a + b);

  }

  if (syntheseData) {
    const syntheseArr = syntheseData.obj;
    totalVehicle = syntheseArr.length;
    vehiculUsedPercent = (totalVehicleUsed * 100) / totalVehicle;

    const vehiculCom = syntheseArr.filter(item => new Date(item['Last communication time']).getMonth() + 1 === new Date().getMonth() + 1);
    TotalVehiculCom = vehiculCom.length;
  }

  if (speedingData) {
    const speedingArr = speedingData.obj;
    const overSpeedVehicleArr = speedingArr.filter(item => parseInt(item['Vitesse maxi']) > 110);
    numberSpeedingVehicle = overSpeedVehicleArr.length;
  }

  const resultTotal = {
    'Total Number of Vehicle': totalVehicle,
    'Number of vehicle communicating': TotalVehiculCom,
    'Number of vehicle used': totalVehicleUsed,
    'percentage of vehicle used': vehiculUsedPercent,
    'Total Km driven (Km)': TotalKm,
    'Average km driven per vehicle (Km)': avrKmDriven,
    'Number of vehicles in speeding': numberSpeedingVehicle,
    'max Speed': vitesseMax
  }

  generateSyntheseSheetAddax(resultTotal, `${pathFile}-${reportTitleDate}.xlsx`,SYNTHESE);

  if (sender && receivers) {
    setTimeout(() => {
      sendMail(sender,test, pass,`${ACTIVITY_REPORT_OF_ADDAX_PETROLEUM}`,`${ACTIVITY_REPORT_SUBJECT_MAIL}`,`${ACTIVITY_REPORT_SUBJECT_MAIL}.xlsx`, path.join(__dirname, `../../${pathFile}-${reportTitleDate}.xlsx`));
    }, 30000)
  } 
}




async function generateAddaxRepports() { 
  await generateAddaxDaylyRepport();
  await generateAddaxDaylyRepport22h06h();
  cron.schedule('30 6 * * *', async () => {
    await generateAddaxDaylyRepport();
    await generateAddaxDaylyRepport22h06h();
  }, {
    scheduled: true,
    timezone: "Africa/Lagos"
  });

  cron.schedule('30 6 3 1,2,3,4,5,6,7,8,9,10,11,12 *', async () => {
    await generateAddaxMonthlyRepport();
  }, {
    scheduled: true,
    timezone: "Africa/Lagos"
  });
}




/* 
 function generateAddax48HAddaxRepport() {
  const twoDaysAgoParams = getfirstAndLastHourDay48H();

  const firstHourDay = twoDaysAgoParams.firstHourDayTimestamp48H;
  const lastHourDay = twoDaysAgoParams.lastHourDayTimestamp48H;
  const titleDate = twoDaysAgoParams.dateTitle;

  const data = await getRepportData(ADMIN_ADDAX, LIST_OF_VEHICLES_NOT_AT_ADDAX_PARKING, ADDAX_PETROLEUM, firstHourDay, lastHourDay, "Not at Parked");

  if (data) {
    const dataFilter = filterData48h(data.obj);
    return dataFilter;
  }
} */


module.exports = { generateAddaxRepports }
