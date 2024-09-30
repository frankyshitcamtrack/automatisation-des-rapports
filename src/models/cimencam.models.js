const { getAllPlaces, getEntryExitData, getVehiclesGroups } = require('../services/cimencam.service');
const { getFistAndLastHourDayIso,getFistAndLastHourDay } = require('../utils/getFirstAndLastHourDay');
const {dateInYyyyMmDdHhMmSs,dateFormatMinusOneDay,dateInYyyyMmDdHhMmSsWithSlash}=require('../utils/dateFormat');
const {secondsToHms}=require('../utils/secondToHrMin');

const { ALL_VEHICLES, CARRIERE_ARGIL, CARRIERE_BIDZA, CARRIERE_FOUMBOT, CARRIERE_SABLE, GAR_BESSENGUE, PORT_KRIBI, USINE_BONABERIE, USINE_FIGUIL, USINE_MORTIER, USINE_NOMAYOS } = require('../constants/vehicleGroups');



async function getVehiculeDescription(id) {
    const vehicle = await getVehicleById(id);
    if (vehicle) {
        const Description = vehicle.Description;
        return Description
    }
}


async function getCimencamData() {
    const notifEntryExitCimencam = [];
    const header = [{ key: 'VEHICULE' }, { key: 'IMMATRICULATION' }, { key: 'TRANSPORTEUR' }, { key: 'SITE' }, { key: 'CHAUFFEUR' }, { key: 'ENTREE' }, { key: 'SORTIE' }, { key: 'DUREE' }];

    const fisthourDay = getFistAndLastHourDayIso().firstHourDayFormat;
    const lastHourDay = getFistAndLastHourDayIso().lasthourDayFormat;
 

    const titleDate = getFistAndLastHourDayIso().dateTitle;
    
    //filter date or get actual date
    const actualDate = new Date();
    const filterDate = dateFormatMinusOneDay(actualDate).split(" ")[0];
    
    const vehicleGroup = await getVehiclesGroups();

    if (vehicleGroup) {

        const AllVehicleGroupId = vehicleGroup.filter(item => item.Description === ALL_VEHICLES)[0].Id;
        //first page entry exit notification for all vehicle
        const fistPageData = await getEntryExitData(AllVehicleGroupId, 1000, 0, fisthourDay, lastHourDay);

        if (fistPageData) {
            const pages = fistPageData.TotalResults / fistPageData.PageSize;

            const arrPages = Array.apply(null, { length: pages + 2 }).map(Number.call, Number);
            if (arrPages) {
                //get all entryexit alert of all cimencam
               return await Promise.all(arrPages?.map(async item => {
                    const data = await getEntryExitData(AllVehicleGroupId, 1000, item, fisthourDay, lastHourDay);
                    if (data) {
                        data.Items.map(it => {
                            if (it) {
                                notifEntryExitCimencam.push(it);
                            }
                        })
                    }
                }
                )).then(() => {
                    //filter notifications by provided geofences
                    const filterNotificationsByProvidedGeofences = notifEntryExitCimencam.filter(item => (
                        item.PlaceDescription === CARRIERE_ARGIL || item.PlaceDescription === CARRIERE_BIDZA || item.PlaceDescription === CARRIERE_FOUMBOT
                        || item.PlaceDescription === CARRIERE_SABLE || item.PlaceDescription === GAR_BESSENGUE || item.PlaceDescription === PORT_KRIBI
                        || item.PlaceDescription === USINE_BONABERIE || item.PlaceDescription === USINE_FIGUIL || item.PlaceDescription === USINE_MORTIER
                        || item.PlaceDescription === USINE_NOMAYOS
                    )
                    );

                     const filterNotificationsByActualEntryDate = filterNotificationsByProvidedGeofences.filter(item=>item.PlaceEntryLocalTimestamp.includes(filterDate));

                    //Range all data as asked
                    const rangeData = filterNotificationsByActualEntryDate.map(item=>{
                        
                        const vehicleDescriptionProps = item.VehicleDescription.split("-");
                        const transporteur = vehicleDescriptionProps.length<3?vehicleDescriptionProps[1]:vehicleDescriptionProps[2];

                        // Format date 
                        const newEntryTime =item.PlaceEntryLocalTimestamp? new Date(item.PlaceEntryLocalTimestamp):null;
                        const newExitTime  =item.PlaceExitLocalTimestamp? new Date (item.PlaceExitLocalTimestamp):null;
                        const entryTime =newEntryTime?dateInYyyyMmDdHhMmSsWithSlash(newEntryTime):'//';
                        const exitTime =newExitTime?dateInYyyyMmDdHhMmSsWithSlash(newExitTime):'//';
                        
                        const chauffeur= item.DriverDescription?item.DriverDescription:'//';


                        return {
                            VEHICULE: item.VehicleDescription,
                            IMMATRICULATION:vehicleDescriptionProps[0],
                            TRANSPORTEUR:transporteur,
                            SITE:item.PlaceDescription,
                            CHAUFFEUR:chauffeur,
                            ENTREE:entryTime,
                            SORTIE:exitTime,
                            DUREE:secondsToHms(item.Duration)
                        }
                    })
                    return { rangeData, header, titleDate }
                })

            }

        }


    }

}


module.exports = { getCimencamData }