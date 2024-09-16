const axios = require('axios');
const {devconfig}= require('../config/mzone.config')

const token = devconfig.cimencamToken;
const base_url= devconfig.baseUrl


//get all groups vehicle
function getVehiclesGroups() {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${base_url}/v2/vehiclegroups.json`,
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

//get all places or geofences
function getAllPlaces() {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${base_url}/v2/places.json',`,
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

//get entry exit by vehicules groups
function getEntryExitData(id,size,page,firstHourDay,lastHourDay){
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${base_url}/v2/vehiclegroups/${id}/placeentryexit/${firstHourDay}/${lastHourDay}.json?pg=${page}&ps=${size}`,
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

module.exports ={getVehiclesGroups,getAllPlaces,getEntryExitData}