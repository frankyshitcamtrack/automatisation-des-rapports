const {generateAddaxRepports}=require('../controllers/addax.controllers');
const {generateDaylyRepportPerenco}=require('../controllers/perenco.controllers')


async function generalControllers(){
  await generateAddaxRepports();
  //await generateDaylyRepportPerenco()
}



module.exports={generalControllers}


