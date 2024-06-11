const {generateAddaxRepports}=require('../controllers/addax.controllers');
const {generateDaylyRepportPerenco,generateHebdoRepportPerenco}=require('../controllers/perenco.controllers')


async function generalControllers(){
//await generateAddaxRepports();
await generateDaylyRepportPerenco()
//await generateHebdoRepportPerenco()
}



module.exports={generalControllers}


