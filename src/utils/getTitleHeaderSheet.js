
const {dateFormatMinusOneDay,} = require('./dateFormat');
const { getFirstAndLastDayMonth } = require('../utils/getFistDayAndLastDayMonth');

function getDate(){
   let endofDay = new Date();
   endofDay.setHours(23, 59, 59, 999);   
   let lasthourDayFormat =dateFormatMinusOneDay(endofDay);

   const firstAndLastDayMonth = getFirstAndLastDayMonth();
   const monthTitle = firstAndLastDayMonth.dateTitle;
   return {lasthourDayFormat,monthTitle}
}


function getTitleHeaderSheet(sheet){
    switch(sheet){
        case 'Not at Parked':
           return 'LIST OF VEHICLES NOT AT ADDAX PARKINGS BETWEEN 22:00 PM TO 06:00 AM';
        break;
        case 'SOMMAIRE':
           return 'ACTIVITY REPORT OF ADDAX PETROLEUM: SOMMAIRE';
        break;
        case 'ACTIVITY CARS':
           return 'ACTIVITY REPORT OF ADDAX PETROLEUM: ACTIVITY CARS';
        break;
        case 'EXCEPTIONS':
            return 'ACTIVITY REPORT OF ADDAX PETROLEUM: EXCEPTIONS';
        break;
        case 'Excessive Idle':
           return 'DAILY EXCEPTION REPORT: EXCESSIVE IDLE';
        break;
        case 'Éco-conduite':
           return 'DAILY EXCEPTION REPORT: ECO CONDUITE';
        break;
        case 'Excès de Vitesse':
            return 'DAILY EXCEPTION REPORT: EXCES DE VITESSE';
        break;
        default:
          return sheet

    }
}


function getTitleHeaderSheetPerenco(sheet){

   switch(sheet){
       case 'Eco driving':
          return 'RAPPORT DETAIL EXCEPTION';
       break;
       case 'Conduite de NUIT':
          return 'RAPPORT DETAIL CONDUITE DE NUIT';
       break;
       case 'Detail Trajet':
          return 'RAPPORT DETAIL TRAJET';
       break;
       case 'Speedings':
           return 'RAPPORT DETAIL EXES DE VITESSE';
       break;
       case 'Zones':
           return 'RAPPORT DETAIL TRAVERSE ZONE BONABERI';
       break;
       case 'SYNTHESE':
          return 'RAPPORT D\'ACTIVITE : SYNTHESE';
       break;
       case 'TRACKING_TRACAFIC':
         return 'RAPPORT HEBDOMADAIRE PERENCO (TAM)';
      break;
       default:
         return sheet
   }
}


function getTitleHeaderSheetGuinness(sheet){
   const date = getDate()
   const previousDay = date.lasthourDayFormat.split(' ')[0]
   const previousMonth =date.monthTitle
   switch(sheet){
       case 'RAPPORT GUINNESS':
          return `RAPPORT JOURNALIER du ${previousDay}`;
       break;
       case 'Excessive Idle':
         return `REPORT GUINNESS OF ${previousMonth}`;
      break;
       default:
         return sheet
   }
}



module.exports={getTitleHeaderSheet,getTitleHeaderSheetPerenco,getTitleHeaderSheetGuinness}