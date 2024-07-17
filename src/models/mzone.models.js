const {getVehiclesGroups,getTripByVehicleGroupWithPositions,getVehicleById}=require('../services/mzone')
const {getFistAndLastHourDayIso}=require('../utils/getFirstAndLastHourDay')

async function getVehiculeDescription(id){
   const vehicle = await getVehicleById(id);
   if(vehicle){
    const Description= vehicle.Description;
    return Description
   }
}


async function getCotcoData() {
    const header =[{key:'VEHICULE'},{key:'HORODATAGE DEBUT'},{key:'LOCALISATION DE DEBUT'},{key:'HORODATAGE FIN'},{key:'LOCALISATION DE FIN'}];
    const fisthourDay = getFistAndLastHourDayIso().firstHourDayFormat;
    const lastHourDay = getFistAndLastHourDayIso().lasthourDayFormat;
    const titleDate = getFistAndLastHourDayIso().dateTitle;
    const vehicleGroup = await getVehiclesGroups();
    if (vehicleGroup) {
        const cotcoId = vehicleGroup.filter(item => item.Description == 'COTCO')[0].Id;
        const trips = await getTripByVehicleGroupWithPositions(cotcoId, fisthourDay, lastHourDay);
        if (trips.length > 0) {
            const utilDataTrips = await Promise.all(trips.map(async item => {
                const vehicleDscription = await getVehiculeDescription(item.VehicleId);
                if(vehicleDscription){
                    return {
                        VEHICULE: vehicleDscription,
                        'HOROTAGE DEBUT': item.StartLocalTimestamp,
                        'LOCALISATION DE DEBUT': item.StartLocation,
                        'HORODATAGE FIN': item.EndLocalTimestamp,
                        'LOCALISATION DE FIN': item.EndLocation
                    }
                } 
            }))
            return {utilDataTrips,header,titleDate};
        }
    }
}


module.exports={getCotcoData,getVehiculeDescription}