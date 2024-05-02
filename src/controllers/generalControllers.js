const {generateAddaxRepports}=require('../controllers/addax.controllers');


async function generalControllers(){
  await generateAddaxRepports();
}



module.exports={generalControllers}


