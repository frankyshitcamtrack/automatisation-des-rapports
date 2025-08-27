const { getData, getTotalData } = require('../services/googleSheetsService');

async function Senders(group, col) {
   const sender = await getData(group, col);
   if (sender) {
      const formatSender = sender[0];
      return formatSender;
   }
}

async function totalSenders(group, col) {
   const sender = await getTotalData(group, col);
   if (sender) {
      const formatSender = sender[0];
      return formatSender;
   }
}

module.exports = { Senders, totalSenders }
