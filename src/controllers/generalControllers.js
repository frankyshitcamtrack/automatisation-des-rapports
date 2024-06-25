const {generateAddaxRepports}=require('../controllers/addax.controllers');
const {generateAllRepportPerenco}=require('../controllers/perenco.controllers')


async function generalControllers(){
await generateAddaxRepports();
await generateAllRepportPerenco();
}



module.exports={generalControllers}


