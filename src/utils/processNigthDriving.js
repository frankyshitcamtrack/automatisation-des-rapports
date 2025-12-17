const { level } = require('../storage/exception.level');
const { KML_POLYGONS } = require('../storage/noso.geojson')

function processNightDrivingSimple(nightDrivingData, drivers, vehicles, transporters, subsidiaries) {
    const driverMap = Object.fromEntries(drivers.map(d => [d.drivid, d]))
    const vehicleMap = Object.fromEntries(vehicles.map(v => [v.vclid, v]));
    const transporterMap = Object.fromEntries(transporters.map(t => [t.trpid, t]));
    const subsidiaryMap = Object.fromEntries(subsidiaries.map(s => [s.affid, s]));


    function isInCity(gps) {
        if (!gps) return false;

        try {

            const coords = gps.replace(/[()]/g, '').split(',');
            if (coords.length < 2) return false;


            const val1 = parseFloat(coords[0].trim());
            const val2 = parseFloat(coords[1].trim());

            if (isNaN(val1) || isNaN(val2)) return false;


            let lat = val1;
            let lon = val2;

            if (
                (lat >= 3.8 && lat <= 4.2 && lon >= 9.5 && lon <= 10.0) ||
                (lat >= 3.7 && lat <= 4.1 && lon >= 11.3 && lon <= 11.7)
            ) {
                return true;
            }


            return false;

        } catch (e) {
            return false;
        }
    }

    function isNightTime(datetime) {
        try {
            const date = new Date(datetime);
            const hours = date.getHours();
            return hours >= 18 || hours === 0;
        } catch {
            return false;
        }
    }

    function formatDuration(hours) {
        const totalSec = Math.round(hours * 3600);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${h}h${m}m${s}s`;
    }



    return nightDrivingData?.map(exception => {


        const startDate = `${exception.startdatetime.toString().split('T')[0]} ${exception.startdatetime.toString().split('T')[1].split('.')[0]}`
        const endDate = `${exception.enddatetime.toString().split('T')[0]} ${exception.enddatetime.toString().split('T')[1].split('.')[0]}`
        const subsidiary = subsidiaryMap[exception?.affiliateid];
        const transporter = transporterMap[exception?.transporterid];
        const vehicle = vehicleMap[exception?.vehicleid];
        const driver = driverMap[exception?.driverid];
        const Level = level.filter(item => item.id === exception.level)

        const derogation = isInCity(exception.startgps) &&
            isInCity(exception.endgps) &&
            isNightTime(exception.startdatetime) &&
            isNightTime(exception.enddatetime);

        return {
            filiale: subsidiary?.nm || 'Inconnu',
            transporteur: transporter?.nm || 'Inconnu',
            Vehicule: vehicle?.vclenm || 'Inconnu',
            Driver: driver?.drivnm || `Chauffeur Inconnu`,
            "start point": exception.startgps,
            "end point": exception.endgps,
            "start date and time": startDate,
            "end date and time": endDate,
            "Total duration": formatDuration(exception.totalduration),
            Exception: "Night driving",
            Niveau: Level[0].value,
            Observation: derogation ? "derogation 00h" : "--"
        };
    });
}



module.exports = { processNightDrivingSimple }