function analyzeDrivers(drivers, exceptions, exceptionsSummary, tripsSummary) {
    // === 1. Map des chauffeurs
    const driversMap = {};
    drivers.forEach(driver => {
        driversMap[driver.drivid] = {
            name: driver.drivnm,
            trpid: driver.trpid
        };
    });

    // === 2. Map des exceptions par ID (pour retrouver les noms)
    const exceptionNames = {};
    exceptions.forEach(ex => {
        exceptionNames[ex.exceptionid] = ex.nm;
    });

    // === 3. Liste des exceptions avec leurs noms cibles
    const mapping = {
        // Conduite de nuit
        nightDriving: [4], // "Night Driving"

        // Conduite hebdomadaire
        weeklyDrive: [9], // "Weekly Drive"

        // Repos hebdomadaire
        weeklyRest: [8], // "Weekly Rest"

        // Travail hebdomadaire
        weeklyWork: [17], // "Weekly Work"

        // Harsh Braking
        harshBraking: [3], // "Harsh Braking"

        // Harsh Acceleration
        harshAcceleration: [2], // "Harsh Acceleration"

        // Téléphone au volant
        phoneCall: [10], // "Phone Call"

        // Cigarette
        smoking: [15], // "Smoking"

        // Ceinture de sécurité
        seatBelt: [11], // "No SeatBelt"

        // Fatigue
        fatigue: [13], // "Fatigue"

        // Distraction
        distraction: [20] // "Distraction"
    };

    // === 4. Calculer les points et compter les exceptions par chauffeur
    const driverStats = {};

    exceptionsSummary.forEach(ex => {
        const driverId = ex.driverid;
        const exceptionId = ex.alertid;
        const level = ex.level;
        const count = ex.nbrexep;

        if (!driverStats[driverId]) {
            driverStats[driverId] = {
                points: 0,
                // Initialiser tous les compteurs
                nightDrivingAlert: 0, nightDrivingAlarm: 0,
                weeklyDriveAlert: 0, weeklyDriveAlarm: 0,
                weeklyRestAlert: 0, weeklyRestAlarm: 0,
                weeklyWorkAlert: 0, weeklyWorkAlarm: 0,
                harshBrakingAlert: 0, harshBrakingAlarm: 0,
                harshAccelerationAlert: 0, harshAccelerationAlarm: 0,
                phoneCall: 0,
                smoking: 0,
                seatBelt: 0,
                fatigue: 0,
                distraction: 0
            };
        }

        // === Ajouter les points perdus
        const exception = exceptions.find(e => e.exceptionid === exceptionId);
        if (exception) {
            const points = level === 1 ? exception.sanctionsalert : exception.sanctionsalarm;
            driverStats[driverId].points += points * count;
        }

        // === Compter par type
        const stat = driverStats[driverId];

        // Fonction pour ajouter selon le level
        const addCount = (baseName, count) => {
            if (level === 1) {
                stat[`${baseName}Alert`] += count;
            } else {
                stat[`${baseName}Alarm`] += count;
            }
        };

        // Vérifier chaque catégorie
        if (mapping.nightDriving.includes(exceptionId)) {
            addCount('nightDriving', count);
        }
        if (mapping.weeklyDrive.includes(exceptionId)) {
            addCount('weeklyDrive', count);
        }
        if (mapping.weeklyRest.includes(exceptionId)) {
            addCount('weeklyRest', count);
        }
        if (mapping.weeklyWork.includes(exceptionId)) {
            addCount('weeklyWork', count);
        }
        if (mapping.harshBraking.includes(exceptionId)) {
            addCount('harshBraking', count);
        }
        if (mapping.harshAcceleration.includes(exceptionId)) {
            addCount('harshAcceleration', count);
        }
        if (mapping.phoneCall.includes(exceptionId)) {
            stat.phoneCall += count;
        }
        if (mapping.smoking.includes(exceptionId)) {
            stat.smoking += count;
        }
        if (mapping.seatBelt.includes(exceptionId)) {
            stat.seatBelt += count;
        }
        if (mapping.fatigue.includes(exceptionId)) {
            stat.fatigue += count;
        }
        if (mapping.distraction.includes(exceptionId)) {
            stat.distraction += count;
        }
    });

    // === 5. Map des trajets
    const tripsPerDriver = {};
    tripsSummary.forEach(trip => {
        tripsPerDriver[trip.driverid] = {
            distance: trip.totdist,
            duration: trip.dur
        };
    });

    // === 6. Construire les résultats
    const results = [];

    Object.keys(driversMap).forEach(driverId => {
        const driver = driversMap[driverId];
        const stats = driverStats[driverId] || {
            points: 0,
            nightDrivingAlert: 0, nightDrivingAlarm: 0,
            weeklyDriveAlert: 0, weeklyDriveAlarm: 0,
            weeklyRestAlert: 0, weeklyRestAlarm: 0,
            weeklyWorkAlert: 0, weeklyWorkAlarm: 0,
            harshBrakingAlert: 0, harshBrakingAlarm: 0,
            harshAccelerationAlert: 0, harshAccelerationAlarm: 0,
            phoneCall: 0, smoking: 0, seatBelt: 0, fatigue: 0, distraction: 0
        };

        const tripInfo = tripsPerDriver[driverId];

        if (tripInfo && tripInfo.distance > 0) {
            const ratio = stats.points / tripInfo.distance;

            results.push({
                Driver: driver.name,
                ...stats,
                "Distance totale Parcouru sur la période": parseFloat(tripInfo.distance.toFixed(3)),
                "Durée de Conduite sur la période": tripInfo.duration,
                "Ratio": ratio,
                "driverId": parseInt(driverId)
            });
        }
    });

    // === 7. Trier : ratio croissant, puis durée décroissante
    results.sort((a, b) => {
        if (a.Ratio !== b.Ratio) return a.Ratio - b.Ratio;
        return b["Durée de Conduite sur la période"] - a["Durée de Conduite sur la période"];
    });

    // === 8. Ajouter le classement
    results.forEach((r, i) => {
        r.Ranking = i + 1;
    });

    // === 9. Formater la durée
    function formatDuration(hours) {
        const totalSeconds = Math.floor(hours * 3600);
        const days = Math.floor(totalSeconds / (24 * 3600));
        const hoursRemain = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${days}Jrs ${String(hoursRemain).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}Min ${String(seconds).padStart(2, '0')}Sec`;
    }

    // === 10. Générer le detailedResults
    const detailedResults = results.map(r => ({
        Driver: r.Driver,
        "Nombres d'Alertes Conduite de nuit": r.nightDrivingAlert || 0,
        "Nombres d'Alarme Conduite de nuit": r.nightDrivingAlarm || 0,
        "Nombres d'Alertes conduite hebdomadaire": r.weeklyDriveAlert || 0,
        "Nombres d'Alarme conduite hebdomadaire": r.weeklyDriveAlarm || 0,
        "Nombres d'Alertes Repos hebdomadaire": r.weeklyRestAlert || 0,
        "Nombres d'Alarme Repos hebdomadaire": r.weeklyRestAlarm || 0,
        "Nombres d'Alertes Travail hebdomadaire": r.weeklyWorkAlert || 0,
        "Nombres d'Alarme Travail hebdomadaire": r.weeklyWorkAlarm || 0,
        "Nombres d'Alertes HB": r.harshBrakingAlert || 0,
        "Nombres d'Alarme HB": r.harshBrakingAlarm || 0,
        "Nombres d'Alertes HA": r.harshAccelerationAlert || 0,
        "Nombres d'Alarme HA": r.harshAccelerationAlarm || 0,
        "Nombres de Téléphone au volant": r.phoneCall || 0,
        "Nombres de smoking": r.smoking || 0,
        "Nombres de Ceinture de Sécurité": r.seatBelt || 0,
        "Nombres de fatigues": r.fatigue || 0,
        "Nombres de distraction": r.distraction || 0,
        "Nombre totale de points perdu sur la période": r.points,
        "Distance totale Parcouru sur la période": r["Distance totale Parcouru sur la période"],
        "Durée de Conduite sur la période": formatDuration(r["Durée de Conduite sur la période"]),
        "Ratio": parseFloat(r.Ratio.toFixed(4)),
        "Ranking": r.Ranking
    }));


    const rankingOnly = results.map(r => ({
        Driver: r.Driver,
        Ranking: r.Ranking
    }));

    return {
        detailedResults,
        rankingOnly
    };
}
module.exports = { analyzeDrivers }
