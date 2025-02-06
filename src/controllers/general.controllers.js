const { generateAddaxRepports } = require('./addax.controllers');
const { generateAllRepportPerenco } = require('./perenco.controllers');
const { generateAllRepportGuinness } = require('./guinness.controllers');
const { generateAllRepportCotco } = require('./cotco.controllers');
const { generateAllRepportCimencam } = require('./cimencam.controllers');
const { generateAllRepportKPDC } = require('./kpdc.controllers');
const { generateAllRepportRazel } = require('./razel.controllers');
const { generateAllRepportDKT } = require('./dkt.controllers');
const { generateAllAliosRepport } = require('./alios.controller');

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
}

module.exports = { generalControllers };
