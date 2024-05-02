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
       case 'Éco driving':
          return 'RAPPORT DETAIL EXCEPTION JOURNALIER';
       break;
       case 'Conduite de NUIT':
          return 'RAPPORT DETAIL CONDUITE DE NUIT';
       break;
       case 'Détail Trajet':
          return 'RAPPORT DETAIL TRAJET JOURNALIER';
       break;
       case 'speeding':
           return 'RAPPORT DETAIL EXES DE VITESSE JOURNALIER';
       break;
       case 'SYNTHESE':
          return 'RAPPORT D\'ACTIVITE JOURNALIER: SYNTHESE';
       break;
       default:
         return sheet

   }
}



module.exports={getTitleHeaderSheet,getTitleHeaderSheetPerenco}