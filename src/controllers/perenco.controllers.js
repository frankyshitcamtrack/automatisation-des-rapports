const path = require('path');
const { generateRepport, getRepportData, getRepportDataUnit } = require('../models/models');
const { getFirstAndLastDayMonth } = require('../utils/getFistDayAndLastDayMonth');
const { getFistAndLastHourDay, getFistAndLastHourDay22H06H, getfirstAndLastHourDay48H } = require('../utils/getFirstAndLastHourDay');
const { generateSyntheseSheetAddax } = require('../utils/genrateXlsx');
const { getDate } = require('../utils/getDateProps');
const { filterData48h } = require('../utils/filterDataBetween22H6H');
const { Receivers } = require('../storage/mailReceivers.storage');
const {Senders}=require('../storage/mailSender.storage')
const { sendMail } = require('../utils/sendMail');
const cron = require('node-cron');



async function generateDaylyRepportPerenco(){
    
}



async function generateRepportPerenco(){

}
