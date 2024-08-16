const axios = require('axios');
const {devconfig}= require('../config/mzone.config')

const token = devconfig.token;
const base_url= devconfig.baseUrl
 

//get vehicle group trips with positions
function getTripByVehicleGroupWithPositions(groupId,startDate,endDate){
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        timeout: 60000,
        url: `${base_url}/v3/vehiclegroups/${groupId}/trips/${startDate}/${endDate}.json?ps=1000&pg=0`,
        headers: {
            'Authorization': `Basic ${token}`
        }
    };

 return axios.request(config)
        .then((response) => {
            const data =response.data.Items;
            return data;
        })
        .catch((error) => {
            console.log(error);
        });
}



//get all groups vehicle
function getVehiclesGroups() {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        timeout: 60000,
        url: `${base_url}/v3/vehiclegroups.json`,
        headers: {
            'Authorization': `Basic ${token}`
        }
    };

return axios.request(config)
        .then((response) => {
            const data =response.data;
            return data.Items;
        })
        .catch((error) => {
            console.log(error);
        });
}


//get vehicle by ID
function getVehicleById(Id){
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        timeout: 60000,
        url: `${base_url}/v3/vehicle/${Id}/vehicle.json`,
        headers: {
            'Authorization': `Basic ${token}`
        }
    };

 return axios.request(config)
        .then((response) => {
            const data = response.data;
            return data;
        })
        .catch((error) => {
            console.log(error);
        });
}



module.exports={getTripByVehicleGroupWithPositions,getVehiclesGroups,getVehicleById}