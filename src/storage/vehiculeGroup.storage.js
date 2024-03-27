const {vehicleGroupRessource}=require('../services/services');
let vehicleGroupArray;

async function getVehicleGroupRessource() {
    const vehicleGroup = await vehicleGroupRessource()
        .then(res =>res.data)
        .catch(err => console.log(err))

    return vehicleGroup;
}


module.exports={getVehicleGroupRessource}