function mergeSimpleParkingData(stationned, vehicles, transporters, subsidiaries) {

    const vehicleMap = Object.fromEntries(
        vehicles?.map(v => [v.vclenm.trim().toUpperCase(), v])
    );

    const transporterMap = Object.fromEntries(
        transporters?.map(t => [t.trpid, t])
    );

    const subsidiaryMap = Object.fromEntries(
        subsidiaries?.map(s => [s.affid, s])
    );

    return stationned.map(item => {
        const vehicleKey = item?.Grouping.trim().toUpperCase();
        const vehicle = vehicleMap[vehicleKey];

        if (!vehicle) return item;

        const transporter = transporterMap[vehicle.trpid];
        const subsidiary = transporter ? subsidiaryMap[transporter.affid] : null;

        return {
            Filiale: subsidiary.nm,
            Transporteur: transporter.nm,
            ...item,
        };
    });
}


module.exports = { mergeSimpleParkingData }