const path = require('path');
const { generateRepport,getRepportData,getRepportDataUnit } = require('../models/models');
const { getFirstAndLastDayMonth } = require('../utils/getFistDayAndLastDayMonth');
const { getFistAndLastHourDay,getFistAndLastHourDay22H06H } = require('../utils/getFirstAndLastHourDay');
const {generateSyntheseSheetAddax}=require('../utils/genrateXlsx')
const { sendMail } = require('../utils/sendMail');
const { iteratee } = require('lodash');



function generateAddaxDaylyRepport() {
    const fistAndLastHourDay = getFistAndLastHourDay();
    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;
    const reportTitleDate = fistAndLastHourDay.dateTitle;
   
    generateRepport("admin ADDAX", "rapport/adax/EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "Excessive Idle", firstHourDay, lastHourDay, reportTitleDate, "Excessive Idle");
    generateRepport("admin ADDAX", "rapport/adax/EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "Éco-conduite", firstHourDay, lastHourDay, reportTitleDate, "Éco-conduite");
    generateRepport("admin ADDAX", "rapport/adax/EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "Excès de Vitesse", firstHourDay, lastHourDay, reportTitleDate, "Excès de Vitesse");
    
 
}


function generateAddaxDaylyRepport22h06h(){
    
    const first22h6h = getFistAndLastHourDay22H06H();
    const firstHour= first22h6h.firstHourDayTimestamp06h;
    const lastHour=first22h6h.lastHourDayTimestamp22h;
    const titleDate=first22h6h.dateTitle;
 
    generateRepport("admin ADDAX", "rapport/adax/LIST-OF-VEHICLES-NOT-AT-ADDAX-PARKING", "LIST-OF-VEHICLES-NOT AT-ADDAX-PARKING", "ADDAX PETROLEUM", "Not at Parked",firstHour,lastHour,titleDate,"Not at Parked");
    

   /*  setTimeout(()=>{
        sendMail('franky.shity@camtrack.net', 'frankyshiti737@gmail.com', 'wsnx llvp nfal ncme', 'EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM', 'Bonjour Mr retrouvez en PJ le rapport de la flotte du mois passé', 'EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM', path.join(__dirname, `../../rapport/adax/LIST-OF-VEHICLES-NOT-AT-ADDAX-PARKING-${titleDate}.xlsx`));
     },10000)  */
}


function generateAddaxMonthlyRepport() {

    const firstDayLastDayMonth = getFirstAndLastDayMonth();

    const firstDayMonth = firstDayLastDayMonth.firstDayTimestamp;
    const lastDayMonth = firstDayLastDayMonth.lastDayTimestamp;
    const reportTitleDate = firstDayLastDayMonth.dateTitle

    generateRepport("admin ADDAX", "rapport/adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "SOMMAIRE", firstDayMonth, lastDayMonth, reportTitleDate, "SOMMAIRE","008000");

    generateRepport("admin ADDAX", "rapport/adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "ACTIVITY CARS", firstDayMonth, lastDayMonth, reportTitleDate,"ACTIVITY CARS",'ff0000');

    generateRepport("admin ADDAX", "rapport/adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "EXCEPTIONS", firstDayMonth, lastDayMonth, reportTitleDate, "EXCEPTIONS","808080");
    
    
}

async function AddaxMonthlyRepportSynthese(){

    const firstDayLastDayMonth = getFirstAndLastDayMonth();

    const firstDayMonth = firstDayLastDayMonth.firstDayTimestamp;
    const lastDayMonth = firstDayLastDayMonth.lastDayTimestamp;
    const reportTitleDate = firstDayLastDayMonth.dateTitle

    const sommaireData=await getRepportData("admin ADDAX","ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ADDAX PETROLEUM", firstDayMonth, lastDayMonth,"SOMMAIRE");
    const syntheseData= await getRepportData("admin ADDAX","SYNTHESE", "ADDAX PETROLEUM", firstDayMonth, lastDayMonth,"Total number of vehicle/véhicle communicating");  
    const speedingData= await getRepportDataUnit("admin ADDAX","EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "ADDAX PETROLEUM", firstDayMonth, lastDayMonth,"Excès de Vitesse")

    if(sommaireData && syntheseData && speedingData){
       const sommaireArr=sommaireData.obj;
       const syntheseArr=syntheseData.obj;

       const speedingArr=speedingData.obj;
       const overSpeedVehicleArr=speedingArr.filter(item=>parseInt(item['Vitesse maxi'])>110);
       const numberSpeedingVehicle=overSpeedVehicleArr.length
       
       const totalVehicle=syntheseArr.length;

       const total=sommaireArr.filter(item=>item['Grouping']==='Total');
       const sommaireArrWithoutTotal=sommaireArr.filter(item=>item['Grouping']!=='Total');
       
       const vehicleUsed=sommaireArrWithoutTotal.filter(item=>item['Heures moteur']!=='00:00:00')
       const totalVehicleUsed=vehicleUsed.length;


       const vehiculUsedPercent=(totalVehicleUsed*100)/totalVehicle;

       const vehiculCom= syntheseArr.filter(item=>new Date(item['Last communication time']).getMonth()+1 === new Date().getMonth()+1)
       const TotalVehiculCom=vehiculCom.length
       
       const kmArr =total.map(item=>{ return parseInt(item['Kilométrage'])})
       const TotalKm=kmArr.reduce((a,b)=>a+b);
       
       const avrKmDriven=Math.floor(TotalKm/totalVehicleUsed); 

       const vitesseMaxArr =total.map(item=>{ return parseInt(item['Vitesse maxi'])})
       const vitesseMax=vitesseMaxArr.reduce((a,b)=>a+b);

       
        const resultTotal = {
            'Total Number of Vehicle': totalVehicle,
            'Number of vehicle communicating': TotalVehiculCom,
            'Number of vehicle used': totalVehicleUsed,
            'percentage of vehicle used': vehiculUsedPercent,
            'Total Km driven (Km)':TotalKm ,
            'Average km driven per vehicle (Km)':avrKmDriven,
            'Number of vehicles in speeding':numberSpeedingVehicle,
            'max Speed':vitesseMax
        }

       generateSyntheseSheetAddax(resultTotal,`rapport/adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM-${reportTitleDate}.xlsx`,"SYNTHESE")
     }
  }
    




function generateAddaxRepports() {
  generateAddaxMonthlyRepport();
    setTimeout(()=>{
        AddaxMonthlyRepportSynthese()
    },5000) 
   generateAddaxDaylyRepport();
   generateAddaxDaylyRepport22h06h();
   
}



module.exports = { generateAddaxRepports }