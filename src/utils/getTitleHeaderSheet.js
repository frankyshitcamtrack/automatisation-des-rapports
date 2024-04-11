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
           return 'DAYLY EXCEPTION REPORT: EXCESSIVE IDLE';
        break;
        case 'Éco-conduite':
           return 'DAYLY EXCEPTION REPORT: ECO CONDUITE';
        break;
        case 'Excès de Vitesse':
            return 'DAYLY EXCEPTION REPORT: EXCES DE VITESSE';
        break;
        default:
          return sheet

    }
}



module.exports={getTitleHeaderSheet}