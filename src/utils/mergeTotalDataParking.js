function mergeSimpleParkingData(stationned, vehicles, transporters, subsidiaries) {

    // Fonction de normalisation
    const normalize = (str) => str
        .toString()
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/[^A-Z0-9]/g, '');

    // Map des véhicules : clé normalisée
    const vehicleMap = Object.fromEntries(
        (vehicles || []).map(v => [normalize(v.vclenm), v])
    );



    const transporterMap = Object.fromEntries(
        (transporters || []).map(t => [t.trpid, t])
    );

    const subsidiaryMap = Object.fromEntries(
        (subsidiaries || []).map(s => [s.affid, s])
    );

    return (stationned || []).map(item => {
        const rawGrouping = item?.Grouping;
        if (!rawGrouping) return item;

        const key = normalize(rawGrouping);
        const vehicle = vehicleMap[key];

        if (!vehicle) {
            // Optionnel : log pour déboguer
            // console.warn(`Véhicule non trouvé: ${rawGrouping} (clé normalisée: ${key})`);
            return item;
        }

        const transporter = transporterMap[vehicle.trpid];
        const subsidiary = transporter ? subsidiaryMap[transporter.affid] : null;

        return {
            Filiale: subsidiary?.nm || 'Inconnu',
            Transporteur: transporter?.nm || 'Inconnu',
            ...item,
        };
    });
}


module.exports = { mergeSimpleParkingData }