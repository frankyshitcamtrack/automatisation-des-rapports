const {getData}=require('../services/googleSheetsService');
const {formatMailReceivers}=require('../utils/formatMailsReceivers')

async function adaxReceivers(){
 const receivers= await getData('ADDAX PETROLEUM','D');
 if(receivers){
    const formatReceivers=formatMailReceivers(receivers);
    return formatReceivers;
 }
}

module.exports={adaxReceivers}