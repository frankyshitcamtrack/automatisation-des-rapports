const {getData}=require('../services/googleSheetsService');

async function Senders(group,col){
 const sender= await getData(group,col);
 if(sender){
    const formatSender=sender[0];
    return formatSender;
 }
}

module.exports={Senders}
