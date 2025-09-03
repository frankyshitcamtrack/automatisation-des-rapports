const cron = require('node-cron');
const { generateAddaxRepports } = require('./addax.controllers');
const { generateAllRepportPerenco } = require('./perenco.controllers');
const { generateAllRepportGuinness } = require('./guinness.controllers');
const { generateAllRepportCotco } = require('./cotco.controllers');
const { generateAllRepportCimencam } = require('./cimencam.controllers');
const { generateAllRepportKPDC } = require('./kpdc.controllers');
const { generateAllRepportRazel } = require('./razel.controllers');
const { generateAllRepportDKT } = require('./dkt.controllers');
const { generateAllAliosRepport } = require('./alios.controller');
const { generateTotalRepports } = require('./total.controllers')

async function generalControllers() {
  await generateAllRepportGuinness();
  await generateAddaxRepports();
  await generateAllRepportPerenco();
  await generateAllRepportCimencam();
  await generateAllRepportCotco();
  await generateAllRepportRazel();
  await generateAllRepportKPDC();
  await generateAllRepportDKT();
  await generateAllAliosRepport();
  //await generateTotalRepports();
  cron.schedule(
    `00 12 * * *`,
    async () => {
      await generateTotalRepports();
    },
    {
      scheduled: true,
      timezone: 'Africa/Lagos',
    }
  );


}

module.exports = { generalControllers };
