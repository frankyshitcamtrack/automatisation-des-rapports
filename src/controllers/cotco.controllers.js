const path = require('path');
const cron = require('node-cron');
const { getCotcoData} = require('../models/mzone.models');
const { CotcoXlsx } = require('../utils/genrateXlsx');
const {RAPPORT_COTCO}=require('../constants/subGroups')
const { deleteFile } = require('../utils/deleteFile')
const { Receivers } = require('../storage/mailReceivers.storage');
const {ADDAX_PETROLEUM}=require('../constants/clients');
const { Senders } = require('../storage/mailSender.storage')
const { sendMail } = require('../utils/sendMail');
const {ACTIVITY_REPORT_SUBJECT_MAIL_COTCO} = require('../constants/mailSubjects');
const {RAPPORT_JOURNALIER_COTCO} = require('../constants/template');
const {dateInYyyyMmDdHhMmSs}= require('../utils/dateFormat');
const _ = require('lodash');


const pass = process.env.PASS_MAIL;

async function generateDaylyRepportCotco() {
    const sender = await Senders(COTCO, 'E');
    const receivers = await Receivers(COTCO, 'D');

    const pathFile = "rapport/Cotco/RAPPORT-COTCO";
    let titleDate ;
    try {
        await getCotcoData()
            .then(async (res) => {
                const dataLenght = res?.utilDataTrips.length;
                titleDate = res?.titleDate;
                if (dataLenght > 0) {
                    const data = res.utilDataTrips.sort((a,b)=>(a.VEHICULE.localeCompare(b.VEHICULE)));
                    const replaceEmptyCol = data.map(item=>{
                        const hD = new Date(item['HOROTAGE DEBUT']);
                        const formatHD = dateInYyyyMmDdHhMmSs(hD);

                        const  hF = new Date(item['HORODATAGE FIN']);
                        const formatHF = dateInYyyyMmDdHhMmSs(hF);
                        
                        if(!item['HOROTAGE DEBUT'] || item['HOROTAGE DEBUT']===null || item['HOROTAGE DEBUT']===undefined){
                           return {
                                VEHICULE: item.VEHICULE,
                                'HORODATAGE DEBUT': '---',
                                'LOCALISATION DE DEBUT':item['LOCALISATION DE DEBUT'],
                                'HORODATAGE FIN': formatHF,
                                'LOCALISATION DE FIN': item['LOCALISATION DE FIN']
                              }
                        }else if(!item['LOCALISATION DE DEBUT'] || item['LOCALISATION DE DEBUT']===null || item['LOCALISATION DE DEBUT']===undefined){
                            return {
                                 VEHICULE: item.VEHICULE,
                                 'HORODATAGE DEBUT': formatHD,
                                 'LOCALISATION DE DEBUT':'---',
                                 'HORODATAGE FIN': formatHF,
                                 'LOCALISATION DE FIN': item['LOCALISATION DE FIN']
                               }
                         }else if(!item['HORODATAGE FIN'] || item['HORODATAGE FIN']===null || item['HORODATAGE FIN'] ===undefined  ){
                            return {
                                 VEHICULE: item.VEHICULE,
                                 'HORODATAGE DEBUT': formatHD,
                                 'LOCALISATION DE DEBUT':item['LOCALISATION DE DEBUT'],
                                 'HORODATAGE FIN': '---',
                                 'LOCALISATION DE FIN': item['LOCALISATION DE FIN']
                               }
                         }
                         else if(!item['LOCALISATION DE FIN'] || item['LOCALISATION DE FIN'] ===null || item['LOCALISATION DE FIN'] ===undefined){
                            return {
                                 VEHICULE: item.VEHICULE,
                                 'HORODATAGE DEBUT': formatHD,
                                 'LOCALISATION DE DEBUT':item['LOCALISATION DE DEBUT'],
                                 'HORODATAGE FIN': formatHF,
                                 'LOCALISATION DE FIN': '---'
                               }
                         }else{
                            return {
                                VEHICULE: item.VEHICULE,
                                'HORODATAGE DEBUT': formatHD,
                                'LOCALISATION DE DEBUT':item['LOCALISATION DE DEBUT'],
                                'HORODATAGE FIN': formatHF,
                                'LOCALISATION DE FIN': item['LOCALISATION DE FIN']
                              }
                        }
                    })

                    //group Data by vehicle
                    const groupByVehicle =_.groupBy(replaceEmptyCol,item=> item.VEHICULE);
                   
                    //change objects to arr and remove key 
                    const arrData = Object.keys(groupByVehicle).map((key) => {
                        return Object.values(groupByVehicle[[key]]) ;
 
                    });

                     //Range Data and get firstLast vehicule start
                    const rangeData = arrData.map(item=>{
                        const itemLength = item.length;
                        const firstEl = item[itemLength-1];
                        const lastEl =item[0];
                        const object = {
                            VEHICULE: firstEl.VEHICULE,
                            'HORODATAGE DEBUT': firstEl['HORODATAGE DEBUT'],
                            'LOCALISATION DE DEBUT': firstEl['LOCALISATION DE DEBUT'],
                            'HORODATAGE FIN': lastEl['HORODATAGE FIN'],
                            'LOCALISATION DE FIN': lastEl['LOCALISATION DE FIN'],
                        }
                        return object;
                    }   
                    )
                   

                    const column = res.header;

                    CotcoXlsx(rangeData,RAPPORT_COTCO,`${pathFile}-${titleDate}.xlsx`, column);
                } else {
                    console.log(`no data found in ${RAPPORT_COTCO}`);
                }
            }) .then(()=>{
            if (sender && receivers) {
              setTimeout(() => {
                sendMail(sender,receivers,pass, RAPPORT_JOURNALIER_COTCO, `${ACTIVITY_REPORT_SUBJECT_MAIL_COTCO}`,`${RAPPORT_JOURNALIER_COTCO}.xlsx`, path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
                deleteFile(path.join(__dirname, `../../${pathFile}-${titleDate}.xlsx`));
              }, 30000)
            } 
          }) .catch(err => console.log(err))
    } catch (err) {
        console.error(err)
    }
}

async function generateAllRepportCotco() {
    //await generateDaylyRepportCotco()
    cron.schedule('30 6 * * *', async () => {
        await generateDaylyRepportCotco()
    }, {
        scheduled: true,
        timezone: "Africa/Lagos"
    });
}


module.exports = { generateAllRepportCotco}
