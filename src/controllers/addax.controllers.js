const path = require('path');
const { generateRepport } = require('../models/models');
const { getFirstAndLastDayMonth } = require('../utils/getFistDayAndLastDayMonth');
const { getFistAndLastHourDay,getFistAndLastHourDay22H06H } = require('../utils/getFirstAndLastHourDay');
const { sendMail } = require('../utils/sendMail');



function generateAddaxDaylyRepport() {
    const fistAndLastHourDay = getFistAndLastHourDay();
    const firstHourDay = fistAndLastHourDay.firstHourDayTimestamp;
    const lastHourDay = fistAndLastHourDay.lastHourDayTimestamp;
    const reportTitleDate = fistAndLastHourDay.dateTitle;
   
  

   
    //generateRepport("admin ADDAX", "rapport/adax/EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "Excessive Idle", firstHourDay, lastHourDay, reportTitleDate, "Excessive Idle");
    generateRepport("admin ADDAX", "rapport/adax/EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "Éco-conduite", firstHourDay, lastHourDay, reportTitleDate, "Éco-conduite");
    //generateRepport("admin ADDAX", "rapport/adax/EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "Excès de Vitesse", firstHourDay, lastHourDay, reportTitleDate, "Excès de Vitesse");
   
   
    
    
 
}


function generateAddaxDaylyRepport22h06h(){
    
    const first22h6h = getFistAndLastHourDay22H06H();
    const firstHour= first22h6h.firstHourDayTimestamp06h;
    const lastHour=first22h6h.lastHourDayTimestamp22h;
    const titleDate=first22h6h.dateTitle;
    const generate=  generateRepport("admin ADDAX", "rapport/adax/LIST-OF-VEHICLES-NOT-AT-ADDAX-PARKING", "LIST-OF-VEHICLES-NOT AT-ADDAX-PARKING", "ADDAX PETROLEUM", "Not at Parked",firstHour,lastHour,titleDate,"Not at Parked");
    
   /*  setTimeout(()=>{
        sendMail('franky.shity@camtrack.net', 'frankyshiti737@gmail.com', 'wsnx llvp nfal ncme', 'EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM', 'Bonjour Mr retrouvez en PJ le rapport de la flotte du mois passé', 'EXCEPTION-REPORT-VEHICULES-ADDAX-PETROLEUM', path.join(__dirname, `../../rapport/adax/LIST-OF-VEHICLES-NOT-AT-ADDAX-PARKING-${titleDate}.xlsx`));
     },10000)  */
}


function generateAddaxMonthlyRepport() {

    const firstDayLastDayMonth = getFirstAndLastDayMonth();

    const firstDayMonth = firstDayLastDayMonth.firstDayTimestamp;
    const lastDayMonth = firstDayLastDayMonth.lastDayTimestamp;
    const reportTitleDate = firstDayLastDayMonth.dateTitle

    //generateRepport("admin ADDAX", "rapport/adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "SOMMAIRE", firstDayMonth, lastDayMonth, reportTitleDate, "SOMMAIRE");


    //generateRepport("admin ADDAX", "rapport/adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "ACTIVITY CARS", firstDayMonth, lastDayMonth, reportTitleDate,"ACTIVITY CARS");


    generateRepport("admin ADDAX", "rapport/adax/ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ACTIVITY-REPORT-OF-ADDAX-PETROLEUM", "ADDAX PETROLEUM", "EXCEPTIONS", firstDayMonth, lastDayMonth, reportTitleDate, "EXCEPTIONS");

}



function generateAddaxRepports() {
    generateAddaxDaylyRepport();
    generateAddaxDaylyRepport22h06h();
    //generateAddaxMonthlyRepport();
}



module.exports = { generateAddaxRepports }