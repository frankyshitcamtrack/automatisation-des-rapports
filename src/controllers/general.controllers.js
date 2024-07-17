const {generateAddaxRepports}=require('./addax.controllers');
const {generateAllRepportPerenco}=require('./perenco.controllers')
const {generateAllRepportGuinness}=require('./guinness.controllers')
const {generateAllRepportCotco}=require('./cotco.controllers')

async function generalControllers(){
await generateAllRepportGuinness()
await generateAddaxRepports();
await generateAllRepportPerenco();
await generateAllRepportCotco()
}


module.exports={generalControllers}


