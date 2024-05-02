const path = require('path');
const { generateRepport, getRepportData, getRepportDataUnit } = require('../models/models');
const { getFirstAndLastDayMonth } = require('../utils/getFistDayAndLastDayMonth');
const { getFistAndLastHourDay, getFistAndLastHourDay22H06H, getfirstAndLastHourDay48H } = require('../utils/getFirstAndLastHourDay');
const { generateSyntheseSheetAddax } = require('../utils/genrateXlsx');
const { getDate } = require('../utils/getDateProps');
const { filterData48h } = require('../utils/filterDataBetween22H6H');
const { Receivers } = require('../storage/mailReceivers.storage');
const { Senders } = require('../storage/mailSender.storage')
const { sendMail } = require('../utils/sendMail');
const cron = require('node-cron');



const pass = process.env.PASS_MAIL;



async function generateAddaxDaylyRepport() {
  const sender = await Senders('ADDAX PETROLEUM', 'E');
  /*  const test =[
     { name: 'frank', address: 'franky.shity@camtrack.net' },
      {name:'mag',address:'magnouvel.mekontso@camtrack.net'}
   ] */
  const receivers = await Receivers('ADDAX PETROLEUM', 'D');
  const fistAndLastHourDay = getFistAndLastHourDay();
  const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
  const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;
  const reportTitleDate = fistAndLastHourDay.dateTitle;


  generateRepport("admin ADDAX", "rapport/Adax/EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "Excessive Idle", firstHourDay, lastHourDay, reportTitleDate, "Excessive Idle");
  generateRepport("admin ADDAX", "rapport/Adax/EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "Éco-conduite", firstHourDay, lastHourDay, reportTitleDate, "Éco-conduite");
  generateRepport("admin ADDAX", "rapport/Adax/EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "Excès de Vitesse", firstHourDay, lastHourDay, reportTitleDate, "Excès de Vitesse");

 if (sender && receivers) {
    setTimeout(() => {
      sendMail(sender, receivers, pass, `EXCEPTION REPORT VEHICULES ADDAX PETROLEUM ${reportTitleDate}`, 'Bonjour Mr retrouvez en PJ le rapport Journalier de la flotte EXCEPTION-REPORT ', 'EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM', path.join(__dirname, `../../rapport/Adax/EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM-${reportTitleDate}.xlsx`));
    }, 60000)

  } 

}


async function generateAddaxDaylyRepport22h06h() {
  const sender = await Senders('ADDAX PETROLEUM', 'E');
  const receivers = await Receivers('ADDAX PETROLEUM', 'D');
  const first22h6h = getFistAndLastHourDay22H06H();
  const firstHour = first22h6h.firstHourDayTimestamp06h;
  const lastHour = first22h6h.lastHourDayTimestamp22h;
  const titleDate = first22h6h.dateTitle;

  generateRepport("admin ADDAX", "rapport/Adax/LIST-OF-VEHICLES-NOT-AT-ADDAX-PARKING", "LIST-OF-VEHICLES-NOT AT-ADDAX-PARKING", "ADDAX PETROLEUM", "Not at Parked", firstHour, lastHour, titleDate, "Not at Parked");

  if (sender && receivers) {
    setTimeout(() => {
      sendMail(sender, receivers, pass, 'LIST-OF-VEHICLES-NOT AT-ADDAX-PARKING', 'Bonjour Mr retrouvez en PJ le rapport Journalier de la flotte Not at parking ', 'EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM.xlsx', path.join(__dirname, `../../rapport/Adax/LIST-OF-VEHICLES-NOT-AT-ADDAX-PARKING-${titleDate}.xlsx`));
    }, 60000)
  }
}


/* 
 function generateAddax48HAddaxRepport() {
  const twoDaysAgoParams = getfirstAndLastHourDay48H();

  const firstHourDay = twoDaysAgoParams.firstHourDayTimestamp48H;
  const lastHourDay = twoDaysAgoParams.lastHourDayTimestamp48H;
  const titleDate = twoDaysAgoParams.dateTitle;

  const data = await getRepportData("admin ADDAX", "LIST-OF-VEHICLES-NOT AT-ADDAX-PARKING", "ADDAX PETROLEUM", firstHourDay, lastHourDay, "Not at Parked");

  if (data) {
    const dataFilter = filterData48h(data.obj);
    return dataFilter;
  }
} */

async function generateAddaxMonthlyRepport() {
  const firstDayLastDayMonth = getFirstAndLastDayMonth();

  const firstDayMonth = firstDayLastDayMonth.firstDayTimestamp;
  const lastDayMonth = firstDayLastDayMonth.lastDayTimestamp;
  const reportTitleDate = firstDayLastDayMonth.dateTitle

  generateRepport("admin ADDAX", "rapport/Adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "SOMMAIRE", firstDayMonth, lastDayMonth, reportTitleDate, "SOMMAIRE", "008000");

  generateRepport("admin ADDAX", "rapport/Adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "ACTIVITY CARS", firstDayMonth, lastDayMonth, reportTitleDate, "ACTIVITY CARS", 'ff0000');

  generateRepport("admin ADDAX", "rapport/Adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "EXCEPTIONS", firstDayMonth, lastDayMonth, reportTitleDate, "EXCEPTIONS", "808080");

  setTimeout(() => {
    AddaxMonthlyRepportSynthese();
  }, 5000)
}




async function AddaxMonthlyRepportSynthese() {
  const sender = await Senders('ADDAX PETROLEUM', 'E');
  const receivers = await Receivers('ADDAX PETROLEUM', 'D');
  const firstDayLastDayMonth = getFirstAndLastDayMonth();

  const firstDayMonth = firstDayLastDayMonth.firstDayTimestamp;
  const lastDayMonth = firstDayLastDayMonth.lastDayTimestamp;
  const reportTitleDate = firstDayLastDayMonth.dateTitle

  const sommaireData = await getRepportData("admin ADDAX", "ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ADDAX PETROLEUM", firstDayMonth, lastDayMonth, "SOMMAIRE");
  const syntheseData = await getRepportData("admin ADDAX", "SYNTHESE", "ADDAX PETROLEUM", firstDayMonth, lastDayMonth, "Total number of vehicle/véhicle communicating");
  const speedingData = await getRepportDataUnit("admin ADDAX", "EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "ADDAX PETROLEUM", firstDayMonth, lastDayMonth, "Excès de Vitesse")

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


  generateSyntheseSheetAddax(resultTotal, `rapport/Adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM-${reportTitleDate}.xlsx`, "SYNTHESE");

  if (sender && receivers) {
    setTimeout(() => {
      sendMail(sender, receivers, pass, 'Monthly ACTIVITY REPORT OF ADDAX PETROLEUM', 'Bonjour Mr retrouvez en PJ le rapport Mensuel de la flotte ACTIVITY-REPORT-OF-ADDAX-PETROLEUM ', 'ACTIVITY-REPORT-OF-ADDAX-PETROLEUM', path.join(__dirname, `../../rapport/Adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM-${reportTitleDate}.xlsx`));
    }, 30000)
  }
}



async function generateAddaxRepports() {
  await generateAddaxDaylyRepport();
  cron.schedule('30 6 * * *', async () => {
    await generateAddaxDaylyRepport();
    //generateAddaxDaylyRepport22h06h();
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



module.exports = { generateAddaxRepports }
