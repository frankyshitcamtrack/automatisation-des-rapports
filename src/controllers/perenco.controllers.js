const path = require('path');
const { generateRepport, getRepportData, getRepportDataUnit } = require('../models/models');
const { getFirstAndLastDayMonth } = require('../utils/getFistDayAndLastDayMonth');
const { getFistAndLastHourDay} = require('../utils/getFirstAndLastHourDay');
const { generateSyntheseSheetAddax } = require('../utils/generateExcelFile/genrateXlsx');
const { getDate } = require('../utils/getDateProps');
const { Receivers } = require('../storage/mailReceivers.storage');
const {Senders}=require('../storage/mailSender.storage')
const { sendMail } = require('../utils/sendMail');
const cron = require('node-cron');



async function generateDaylyRepportPerenco(){
 
}



async function generateRepportPerenco(){

}
