const { generateAddaxRepports } = require('./addax.controllers');
const { generateAllRepportPerenco } = require('./perenco.controllers');
const { generateAllRepportGuinness } = require('./guinness.controllers');
const { generateAllRepportCotco } = require('./cotco.controllers');
const { generateAllRepportCimencam } = require('./cimencam.controllers');
const { generateAllRepportKPDC } = require('./kpdc.controllers');
const { generateAllRepportRazel } = require('./razel.controllers');

async function generalControllers() {
  await generateAllRepportGuinness();
  await generateAddaxRepports();
  await generateAllRepportPerenco();
  await generateAllRepportCimencam();
  await generateAllRepportCotco();
  await generateAllRepportKPDC();
  //await generateAllRepportRazel();
}

module.exports = { generalControllers };
