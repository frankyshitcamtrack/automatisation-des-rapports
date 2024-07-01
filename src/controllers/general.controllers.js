const {generateAddaxRepports}=require('./addax.controllers');
const {generateAllRepportPerenco}=require('./perenco.controllers')
const {generateAllRepportGuinness}=require('./guinness.controllers')


async function generalControllers(){
await generateAllRepportGuinness()
await generateAddaxRepports();
await generateAllRepportPerenco();
}



module.exports={generalControllers}


