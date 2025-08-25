function analyzeDrivers(drivers, exceptions, exceptionsSummary, tripsSummary) {
    // Étape 1: Créer un mapping des chauffeurs par ID
    const driversMap = {};
    drivers.forEach(driver => {
        driversMap[driver.drivid] = {
            name: driver.drivnm,
            trpid: driver.trpid
        };
    });

    // Étape 2: Créer un mapping des sanctions par exception
    const sanctionsMap = {};
    exceptions.forEach(exception => {
        sanctionsMap[exception.exceptionid] = {
            alert: exception.sanctionsalert,
            alarm: exception.sanctionsalarm
        };
    });

    // Étape 3: Calculer les points perdus par chauffeur
    const pointsPerDriver = {};

    exceptionsSummary.forEach(exception => {
        if (!pointsPerDriver[exception.driverid]) {
            pointsPerDriver[exception.driverid] = 0;
        }

        const sanctionInfo = sanctionsMap[exception.alertid];
        if (sanctionInfo) {
            // Niveau 1: alert, Niveau 2-3: alarm
            const points = exception.level === 1 ? sanctionInfo.alert : sanctionInfo.alarm;
            pointsPerDriver[exception.driverid] += points * exception.nbrexep;
        }
    });

    // Étape 4: Récupérer les distances et durées par chauffeur
    const tripsPerDriver = {};

    tripsSummary.forEach(trip => {
        tripsPerDriver[trip.driverid] = {
            distance: trip.totdist,
            duration: trip.dur,
            tripDuration: trip.tripdur
        };
    });

    // Étape 5: Calculer les résultats pour chaque chauffeur
    const results = [];

    Object.keys(driversMap).forEach(driverId => {
        const driver = driversMap[driverId];
        const points = pointsPerDriver[driverId] || 0;
        const tripInfo = tripsPerDriver[driverId];

        if (tripInfo && tripInfo.distance > 0) {
            const ratio = points / tripInfo.distance;

            results.push({
                Driver: driver.name,
                "Nombre totale de points perdu sur la période": points,
                "Distance totale Parcouru sur la période": tripInfo.distance,
                "Durée de Conduite sur la période": tripInfo.duration,
                "Ratio": ratio,
                "driverId": parseInt(driverId) // Pour le tri
            });
        }
    });

    // Étape 6: Trier par ratio (du plus bas au plus élevé)
    results.sort((a, b) => a.Ratio - b.Ratio);

    // Étape 7: Ajouter le ranking
    results.forEach((result, index) => {
        result.Ranking = index + 1;
    });

    // Étape 8: Formater les résultats finaux
    const finalResults = results.map(result => ({
        Driver: result.Driver,
        "Nombre totale de points perdu sur la période": result["Nombre totale de points perdu sur la période"],
        "Distance totale Parcouru sur la période": result["Distance totale Parcouru sur la période"],
        "Durée de Conduite sur la période": result["Durée de Conduite sur la période"],
        "Ratio": parseFloat(result.Ratio.toFixed(4)),
        "Ranking": result.Ranking
    }));

    // Étape 9: Créer le classement simplifié
    const rankingOnly = results.map(result => ({
        Driver: result.Driver,
        Ranking: result.Ranking
    }));

    return {
        detailedResults: finalResults,
        rankingOnly: rankingOnly
    };
}

module.exports = { analyzeDrivers }
