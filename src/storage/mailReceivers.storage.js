const { getData, getTotalData } = require('../services/googleSheetsService');
const { formatMailReceivers } = require('../utils/formatMailsReceivers')

async function Receivers(group, col) {
   // senders 'ADDAX PETROLEUM','E'
   // receivers'ADDAX PETROLEUM','D'
   const receivers = await getData(group, col);
   if (receivers) {
      const formatReceivers = formatMailReceivers(receivers);
      return formatReceivers;
   }
}

async function totalReceivers(group, col) {
   const receivers = await getTotalData(group, col);
   if (receivers) {
      const formatReceivers = formatMailReceivers(receivers);
      return formatReceivers;
   }
}

module.exports = { Receivers, totalReceivers }
