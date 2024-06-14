const {generateAddaxRepports}=require('../controllers/addax.controllers');
const {generateHebdoRepportPerenco,generateDaylyRepportPerenco}=require('../controllers/perenco.controllers')


async function generalControllers(){
await generateAddaxRepports();
//await  generateDaylyRepportPerenco();
//await generateHebdoRepportPerenco();
}



module.exports={generalControllers}


