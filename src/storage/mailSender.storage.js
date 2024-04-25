const {getData}=require('../services/googleSheetsService');

async function addaxSender(){
 const sender= await getData('ADDAX PETROLEUM','E');
 if(sender){
    const formatSender=sender[0];
    return formatSender;
 }
}

module.exports={addaxSender}
