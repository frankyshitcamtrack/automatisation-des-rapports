const path = require('path');
const cron = require('node-cron');
const {getRepportData} = require('../models/models');
const { getFistAndLastHourDay} = require('../utils/getFirstAndLastHourDay');
const {addAffectationsColumn} = require('../utils/createAffectationcolumnperenco');
const {zoneExcesDeVitesse} = require('../utils/addTypeZoneExcesVitesse');
const {addCriticiteProps} = require('../utils/createCriticitecol');
const {addIntervalles}=require('../utils/createIntervallesColl')
const {utilisateurNullEcodriving,utilisateurNullDetailTrajet,utilisateurNullConduiteDeNuit,utilisateurNullExcesVitess}=require('../utils/replaceUtilisateurNull')
const {perencoXlsx} = require('../utils/genrateXlsx');
const { Receivers } = require('../storage/mailReceivers.storage');
const {Senders}=require('../storage/mailSender.storage')
const { sendMail } = require('../utils/sendMail');
const {PERENCO}=require('../constants/clients');
const {ADMIN_PERENCO}=require('../constants/ressourcesClient');
const {RAPPORT_ACTIVITE_FLOTTE_PERENCO,RAPPORT_EXCES_DE_VITESSE_FLOTTE,}=require('../constants/template');
const { 
  SPEEDING,
  ECO_DRIVING,
  DETAIL_TRAJET,
  CONDUITE_DE_NUIT,
  SPEEDING_DETAIL,
  EXCES_DE_VITESSE_HORS_VILLE,
  EXCES_DE_VITESSE_BASE_WOURI,
  EXCES_DE_VITESSE_LEGERE_HORS_VILLE,
  EXCES_DE_VITESSE_LEGERE_NAT3_VILLE,
  EXCES_DE_VITESSE_LEGERE_VILLE,
  EXCES_DE_VITESSE_PISTE_BIPAGA,
  EXCES_DE_VITESSE_SEVERE_HORS_VILLE,
  EXCES_DE_VITESSE_SEVERE_NAT3_VILLE,
  EXCES_DE_VITESSE_SEVERE_VILLE
}=require('../constants/subGroups');


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

        //add affectations properties to data
        const dataWithAffectationColumn=addAffectationsColumn(data);

        const rangeData = dataWithAffectationColumn.map(item=>{
          if(item){
            return {
               Grouping:item.Grouping,
               Affectations:item.Affectations,
               Conducteur: item.Conducteur,
               Infraction:item.Infraction,
               Valeur: item.Valeur,
               Début: item['Début'],
               "Emplacement initial": item['Emplacement initial'],
               Fin: item['Fin'],
               "Lieu d'arrivée":item["Lieu d'arrivée"],
               "Vitesse maxi": item['Vitesse maxi'],
               'Violation duration': item['Violation duration'],
               Kilométrage: item['Kilométrage']
  
            }
          }
        })
        
        const updateDataWithoutUser= utilisateurNullEcodriving(rangeData)

        //add affectation header at the 1 index
        column.splice(1,0,{key:'Affectations'});

        await perencoXlsx(updateDataWithoutUser,ECO_DRIVING,`${pathFile}-${titleDate}.xlsx`,column);

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
          const dataWithAffectationColumn=addAffectationsColumn(data);
          const rangeData = dataWithAffectationColumn.map(item=>{
            if(item){
              return {
                 Grouping:item.Grouping,
                 Affectations:item.Affectations,
                 Conducteur: item.Conducteur,
                 Début: item['Début'],
                 'Lieu de Départ': item['Lieu de Départ'],
                  Fin:item.Fin,
                 "Lieu d'arrivée":item["Lieu d'arrivée"],
                  Durée: item['Durée'],
                 'En mouvement':item['En mouvement'],
                 'Ralenti moteur':item['Ralenti moteur'],
                  Distance: item.Distance,
                 'Temps total': item['Temps total'],
                  Arrêts: item['Arrêts'],
                 'Vitesse maxi': item['Vitesse maxi']
    
              }
            }
          })
  

          const updateDataWithoutUser=utilisateurNullDetailTrajet(rangeData)
          //add affectation header at the 1 index
          column.splice(1,0,{key:'Affectations'});

          await perencoXlsx(updateDataWithoutUser,DETAIL_TRAJET,`${pathFile}-${titleDate}.xlsx`,column);
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
          const dataWithAffectationColumn=addAffectationsColumn(data);

          const rangeData = dataWithAffectationColumn.map(item=>{
            if(item){
              return {
                Grouping:item.Grouping,
                Affectations:item.Affectations,
                Conducteur: item.Conducteur,
                'Début': item['Début'],
                'Lieu de Départ':item['Lieu de Départ'],
                Fin:item.Fin,
                "Lieu d'arrivée": item[ "Lieu d'arrivée"],
                'Durée':item['Durée'],
                'En mouvement':item['En mouvement'],
                'Ralenti moteur': item['Ralenti moteur'],
                Distance: item.Distance,
                'Vitesse maxi':item['Vitesse maxi']
             }
            }
          })
          
          const updateDataWithoutUser= utilisateurNullConduiteDeNuit(rangeData);

          const createIntervallesCol = addIntervalles(updateDataWithoutUser);

           //add affectation header at the 1 index
          column.splice(1,0,{key:'Affectations'});

          column.splice(3,0,{key:'Intervalles'});
  
          await perencoXlsx(createIntervallesCol,CONDUITE_DE_NUIT,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${CONDUITE_DE_NUIT}`);
        }
      }).catch(err => console.log(err))
    }) 
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_EXCES_DE_VITESSE_FLOTTE,PERENCO,firstHourDay,lastHourDay,EXCES_DE_VITESSE_LEGERE_VILLE)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          const dataWithAffectationColumn=addAffectationsColumn(data);

          const rangeData = dataWithAffectationColumn.map(item=>{
            if(item){
              return {
                 Grouping:item.Grouping,
                 Affectations:item.Affectations,
                 Conducteur: item.Conducteur,
                 'Date et heure': item['Date et heure'],
                 Lieu: item.Lieu,
                 'Vitesse maxi': item['Vitesse maxi'],
                 'Durée': item['Durée']
    
              }
            }
          })

          
          const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

          const arrDataWithZone= zoneExcesDeVitesse(updateDataWithoutUser,EXCES_DE_VITESSE_SEVERE_VILLE);

          const newArrData = addCriticiteProps(arrDataWithZone);

           //add affectation header at the 1 index
           column.splice(1,0,{key:'Affectations'});

           //add affectation header at the 1 index
           column.splice(3,0,{key:"Zone d'exces de vitesse"});

           //add affectation header at the 1 index
           column.splice(4,0,{key:"Criticité"});

          await perencoXlsx(newArrData,SPEEDING_DETAIL,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_LEGERE_VILLE}`);
        }
      }).catch(err => console.log(err))
    })
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_EXCES_DE_VITESSE_FLOTTE,PERENCO,firstHourDay,lastHourDay, EXCES_DE_VITESSE_SEVERE_VILLE)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          const dataWithAffectationColumn=addAffectationsColumn(data);
          const rangeData = dataWithAffectationColumn.map(item=>{
            if(item){
              return {
                 Grouping:item.Grouping,
                 Affectations:item.Affectations,
                 Conducteur: item.Conducteur,
                 'Date et heure': item['Date et heure'],
                 Lieu: item.Lieu,
                 'Vitesse maxi': item['Vitesse maxi'],
                 'Durée': item['Durée']
    
              }
            }
          })
                   
          const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

          const arrDataWithZone= zoneExcesDeVitesse(updateDataWithoutUser,EXCES_DE_VITESSE_SEVERE_VILLE);

          const newArrData = addCriticiteProps(arrDataWithZone);

      
          //add affectation header at the 1 index
          column.splice(1,0,{key:'Affectations'});

          //add affectation header at the 1 index
          column.splice(3,0,{key:"Zone d'exces de vitesse"});

          //add affectation header at the 1 index
          column.splice(4,0,{key:"Criticité"});
          
          await perencoXlsx(newArrData,SPEEDING_DETAIL,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_ACTIVITE_FLOTTE_PERENCO} ${EXCES_DE_VITESSE_SEVERE_VILLE}`);
        }
      }).catch(err => console.log(err))
    })
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_EXCES_DE_VITESSE_FLOTTE,PERENCO,firstHourDay,lastHourDay, EXCES_DE_VITESSE_HORS_VILLE)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          const dataWithAffectationColumn=addAffectationsColumn(data);
          const rangeData = dataWithAffectationColumn.map(item=>{
            if(item){
              return {
                 Grouping:item.Grouping,
                 Affectations:item.Affectations,
                 Conducteur: item.Conducteur,
                 'Date et heure': item['Date et heure'],
                 Lieu: item.Lieu,
                 'Vitesse maxi': item['Vitesse maxi'],
                 'Durée': item['Durée']
              }
            }
          })

          const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

          const arrDataWithZone= zoneExcesDeVitesse(updateDataWithoutUser,EXCES_DE_VITESSE_SEVERE_VILLE);

          const newArrData = addCriticiteProps(arrDataWithZone);

          //add affectation header at the 1 index
          column.splice(1,0,{key:'Affectations'});

          //add affectation header at the 1 index
          column.splice(3,0,{key:"Zone d'exces de vitesse"});

          //add affectation header at the 1 index
          column.splice(4,0,{key:"Criticité"});

          await perencoXlsx(newArrData,SPEEDING_DETAIL,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${ EXCES_DE_VITESSE_HORS_VILLE}`);
        }
      }).catch(err => console.log(err))
    })
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_EXCES_DE_VITESSE_FLOTTE,PERENCO,firstHourDay,lastHourDay,EXCES_DE_VITESSE_LEGERE_NAT3_VILLE)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          const dataWithAffectationColumn=addAffectationsColumn(data);
          const rangeData = dataWithAffectationColumn.map(item=>{
            if(item){
              return {
                 Grouping:item.Grouping,
                 Affectations:item.Affectations,
                 Conducteur: item.Conducteur,
                 'Date et heure': item['Date et heure'],
                 Lieu: item.Lieu,
                 'Vitesse maxi': item['Vitesse maxi'],
                 'Durée': item['Durée']
    
              }
            }
          })

          const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

          const arrDataWithZone= zoneExcesDeVitesse(updateDataWithoutUser,EXCES_DE_VITESSE_SEVERE_VILLE);

          const newArrData = addCriticiteProps(arrDataWithZone);


          //add affectation header at the 1 index
          column.splice(1,0,{key:'Affectations'});

          //add affectation header at the 1 index
          column.splice(3,0,{key:"Zone d'exces de vitesse"});

          //add affectation header at the 1 index
          column.splice(4,0,{key:"Criticité"});

          await perencoXlsx(newArrData,SPEEDING_DETAIL,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_LEGERE_NAT3_VILLE}`);
        }
      }).catch(err => console.log(err))
    })
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_EXCES_DE_VITESSE_FLOTTE,PERENCO,firstHourDay,lastHourDay,EXCES_DE_VITESSE_SEVERE_HORS_VILLE)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          const dataWithAffectationColumn=addAffectationsColumn(data);
          const rangeData = dataWithAffectationColumn.map(item=>{
            if(item){
              return {
                 Grouping:item.Grouping,
                 Affectations:item.Affectations,
                 Conducteur: item.Conducteur,
                 'Date et heure': item['Date et heure'],
                 Lieu: item.Lieu,
                 'Vitesse maxi': item['Vitesse maxi'],
                 'Durée': item['Durée']
    
              }
            }
          })

           
          const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

          const arrDataWithZone= zoneExcesDeVitesse(updateDataWithoutUser,EXCES_DE_VITESSE_SEVERE_VILLE);

          const newArrData = addCriticiteProps(arrDataWithZone);


          //add affectation header at the 1 index
          column.splice(1,0,{key:'Affectations'});

          //add affectation header at the 1 index
          column.splice(3,0,{key:"Zone d'exces de vitesse"});

          //add affectation header at the 1 index
          column.splice(4,0,{key:"Criticité"});

          await perencoXlsx(newArrData,SPEEDING_DETAIL,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_SEVERE_HORS_VILLE}`);
        }
      }).catch(err => console.log(err))
    }) 
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_EXCES_DE_VITESSE_FLOTTE,PERENCO,firstHourDay,lastHourDay,EXCES_DE_VITESSE_SEVERE_NAT3_VILLE)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          const dataWithAffectationColumn=addAffectationsColumn(data);
          const rangeData = dataWithAffectationColumn.map(item=>{
            if(item){
              return {
                 Grouping:item.Grouping,
                 Affectations:item.Affectations,
                 Conducteur: item.Conducteur,
                 'Date et heure': item['Date et heure'],
                 Lieu: item.Lieu,
                 'Vitesse maxi': item['Vitesse maxi'],
                 'Durée': item['Durée']
    
              }
            }
          })
           
          const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

          const arrDataWithZone= zoneExcesDeVitesse(updateDataWithoutUser,EXCES_DE_VITESSE_SEVERE_VILLE);

          const newArrData = addCriticiteProps(arrDataWithZone);

          //add affectation header at the 1 index
          column.splice(1,0,{key:'Affectations'});

          //add affectation header at the 1 index
          column.splice(3,0,{key:"Zone d'exces de vitesse"});

          //add affectation header at the 1 index
          column.splice(4,0,{key:"Criticité"});

          await perencoXlsx(newArrData,SPEEDING_DETAIL,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_SEVERE_NAT3_VILLE}`);
        }
      }).catch(err => console.log(err))
    })
    .then(async()=>{
      await getRepportData(ADMIN_PERENCO,RAPPORT_EXCES_DE_VITESSE_FLOTTE,PERENCO,firstHourDay,lastHourDay,EXCES_DE_VITESSE_LEGERE_HORS_VILLE)
      .then(async(res)=>{
        const objLenth=res?.obj.length;
        if(objLenth>0){
          const data= res.obj;
          const column=res.excelColum;
          const dataWithAffectationColumn=addAffectationsColumn(data);
          const rangeData = dataWithAffectationColumn.map(item=>{
            return {
               Grouping:item.Grouping,
               Affectations:item.Affectations,
               Conducteur: item.Conducteur,
               'Date et heure': item['Date et heure'],
               Lieu: item.Lieu,
               'Vitesse maxi': item['Vitesse maxi'],
               'Durée': item['Durée']
  
            }
          })

          const updateDataWithoutUser = utilisateurNullExcesVitess(rangeData);

          const arrDataWithZone= zoneExcesDeVitesse(updateDataWithoutUser,EXCES_DE_VITESSE_SEVERE_VILLE);

          const newArrData = addCriticiteProps(arrDataWithZone);
          
          //add affectation header at the 1 index
          column.splice(1,0,{key:'Affectations'});

          //add affectation header at the 1 index
          column.splice(3,0,{key:"Zone d'exces de vitesse"});

          //add affectation header at the 1 index
          column.splice(4,0,{key:"Criticité"});

          await perencoXlsx(newArrData,SPEEDING_DETAIL,`${pathFile}-${titleDate}.xlsx`,column);
        }else{
          console.log(`no data found in ${RAPPORT_EXCES_DE_VITESSE_FLOTTE} ${EXCES_DE_VITESSE_LEGERE_HORS_VILLE}`);
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