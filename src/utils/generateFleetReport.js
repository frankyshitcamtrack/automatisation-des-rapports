function generateFleetReport(data) {
    const byTransporteur = {};

    data.forEach(vehicle => {
        const transporteur = vehicle.Transporteur;
        if (!byTransporteur[transporteur]) {
            byTransporteur[transporteur] = [];
        }
        byTransporteur[transporteur].push(vehicle);
    });

    return Object.entries(byTransporteur).map(([transporteur, vehicles]) => {

        const validTimes = vehicles
            .map(v => {
                const heure = v['Heure de Cloture'];
                if (heure && typeof heure === 'object' && heure.text) {
                    return new Date(heure.text);
                }
                if (typeof heure === 'string' && heure !== '-----') {
                    return new Date(heure);
                }
                return null;
            })
            .filter(date => date && !isNaN(date.getTime()));

        const derniereHeure = validTimes.length > 0
            ? new Date(Math.max(...validTimes)).toLocaleString('fr-FR')
            : 'N/A';


        const hasActiveVehicle = vehicles.some(vehicle => {
            const status = vehicle['Status Ignition'];

            return status === "ON";
        });

        const numberVehicleActives = vehicles.filter(vehicle => {
            const status = vehicle['Status Ignition'];
            return status === "ON";
        }).length


        const camionsHorsPOI = vehicles.filter(v => v['Statut POI'] === 'Hors POI').length;


        return {
            "Transporteur": transporteur,
            "Nombre De Camions": vehicles.length,
            "Heure De cloture": hasActiveVehicle ? '--' : derniereHeure,
            "Nombres de Véhicules Actifs": numberVehicleActives,
            "Etat flotte": hasActiveVehicle ? 'Flotte ON' : 'Flotte OFF',
            "Camions Hors POI": camionsHorsPOI,
            "Derniere mise a jour": new Date().toLocaleString('fr-FR')
        };
    });
}
module.exports = { generateFleetReport }