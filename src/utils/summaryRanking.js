
function filtrerExceptions(exceptionsArray) {
    const nomsRecherches = new Set([
        'Night Driving',
        'Weekly Drive',
        'Weekly Rest',
        'Weekly Work',
        'Daily Work',
        'Continuous Drive',
        'Harsh Braking',
        'Harsh Acceleration',
        'Phone Call',
        'Smoking',
        'No SeatBelt',
        'Fatigue',
        'Distraction'
    ]);

    return exceptionsArray.filter(exception => nomsRecherches.has(exception.nm));
}

function analyzeDrivers(drivers, exceptions, exceptionsSummary, tripsSummary) {
    // === 1. Map des chauffeurs par ID
    const driversMap = {};
    drivers.forEach(driver => {
        driversMap[driver.drivid] = { name: driver.drivnm };
    });



    // === 2. Filtrer les exceptions pertinentes
    const filteredExceptions = filtrerExceptions(exceptions);

    // === 3. Map exceptionid → exception
    const exceptionById = {};
    filteredExceptions.forEach(ex => {
        exceptionById[ex.exceptionid] = ex;
    });

    // === 4. Mapping ID → catégorie
    const categoryMap = {
        4: 'nightDriving',           // Night Driving
        9: 'weeklyDrive',            // Weekly Drive
        8: 'weeklyRest',             // Weekly Rest
        17: 'weeklyWork',            // Weekly Work
        16: 'dailyWork',             // Daily Work
        5: 'continuousDrive',        // Continuous Drive
        3: 'harshBraking',           // Harsh Braking
        2: 'harshAcceleration',      // Harsh Acceleration
        10: 'phoneCall',             // Phone Call
        15: 'smoking',               // Smoking
        11: 'seatBelt',              // No SeatBelt
        13: 'fatigue',               // Fatigue
        20: 'distraction'            // Distraction
    };

    // === 5. Initialiser stats par driverId
    const driverStats = {};
    Object.keys(driversMap).forEach(driverId => {
        driverStats[driverId] = {
            points: 0,
            nightDrivingAlert: 0, nightDrivingAlarm: 0,
            weeklyDriveAlert: 0, weeklyDriveAlarm: 0,
            weeklyRestAlert: 0, weeklyRestAlarm: 0,
            weeklyWorkAlert: 0, weeklyWorkAlarm: 0,
            dailyWorkAlert: 0, dailyWorkAlarm: 0,
            continuousDriveAlert: 0, continuousDriveAlarm: 0,
            harshBrakingAlert: 0, harshBrakingAlarm: 0,
            harshAccelerationAlert: 0, harshAccelerationAlarm: 0,
            phoneCall: 0,
            smoking: 0,
            seatBelt: 0,
            fatigue: 0,
            distraction: 0
        };
    });

    // === 6. Remplir les stats à partir de exceptionsSummary
    exceptionsSummary.forEach(ex => {
        const driverId = String(ex.driverid);
        const exceptionId = ex.alertid;
        const level = ex.level;
        const count = ex.nbrexep || 0;

        if (!driversMap[driverId]) return;
        const stat = driverStats[driverId];
        if (!stat) return;

        const exception = exceptionById[exceptionId];
        if (exception) {
            const points = level === 1 ? exception.sanctionsalert : exception.sanctionsalarm;
            stat.points += points * count;
        }

        const addCount = (baseName, cnt) => {
            const key = level === 1 ? `${baseName}Alert` : `${baseName}Alarm`;
            stat[key] = (stat[key] || 0) + cnt;
        };

        const category = categoryMap[exceptionId];
        if (!category) return;

        const alertAlarmCategories = [
            'nightDriving', 'weeklyDrive', 'weeklyRest', 'weeklyWork',
            'dailyWork', 'continuousDrive', 'harshBraking', 'harshAcceleration'
        ];

        if (alertAlarmCategories.includes(category)) {
            addCount(category, count);
        } else {
            stat[category] = (stat[category] || 0) + count;
        }
    });

    // === 7. Map des trajets
    const tripsPerDriver = {};
    tripsSummary.forEach(trip => {
        const driverId = String(trip.driverid);
        tripsPerDriver[driverId] = {
            distance: parseFloat(trip.totdist) || 0,
            duration: parseFloat(trip.dur) || 0
        };
    });

    // === 8. Construire résultats par chauffeur (avant fusion)
    const allDriverResults = [];

    Object.keys(driversMap).forEach(driverId => {
        const driver = driversMap[driverId];
        const stats = driverStats[driverId];
        const tripInfo = tripsPerDriver[driverId] || { distance: 0, duration: 0 };

        const distance = tripInfo.distance;
        const duration = tripInfo.duration;
        const isActive = distance > 0;
        const ratio = isActive ? stats.points / distance : 0;

        allDriverResults.push({
            Driver: driver.name.trim(), // Nettoyage du nom
            ...stats,
            "Distance totale Parcouru sur la période": distance,
            "Durée de Conduite sur la période": duration,
            "Ratio": ratio,
            driverId: parseInt(driverId),
            isActive
        });
    });

    // === 🔥 9. Fusionner les chauffeurs ayant le même nom (insensible aux espaces)
    const mergedResultsMap = {};

    allDriverResults.forEach(result => {
        const name = result.Driver; // Déjà trimmé

        if (!mergedResultsMap[name]) {
            // Initialiser
            mergedResultsMap[name] = { ...result };
            // Remettre à zéro les compteurs numériques
            Object.keys(mergedResultsMap[name]).forEach(key => {
                if (typeof mergedResultsMap[name][key] === 'number' && key !== 'driverId') {
                    mergedResultsMap[name][key] = 0;
                }
            });
            mergedResultsMap[name].driverIds = []; // Optionnel : trace des IDs
        }

        const merged = mergedResultsMap[name];

        // Additionner toutes les valeurs numériques
        Object.keys(result).forEach(key => {
            if (typeof result[key] === 'number' && key !== 'driverId') {
                merged[key] += result[key];
            }
        });

        merged.driverIds.push(result.driverId);
    });

    const mergedResults = Object.values(mergedResultsMap);

    // === 10. Séparer actifs et inactifs (après fusion)
    const activeResults = [];
    const inactiveResults = [];

    mergedResults.forEach(result => {
        const distance = result["Distance totale Parcouru sur la période"];
        const isActive = distance > 0;
        const totalPoints = result.points;
        const ratio = isActive ? parseFloat((totalPoints / distance).toFixed(4)) : 0;

        if (isActive) {
            activeResults.push({
                Driver: result.Driver,
                ...result,
                "Ratio": ratio,
                "Distance totale Parcouru sur la période": parseFloat(distance.toFixed(3)),
                "Durée de Conduite sur la période": result["Durée de Conduite sur la période"]
            });
        } else {
            inactiveResults.push({
                Driver: result.Driver,
                points: "--",
                nightDrivingAlert: "--", nightDrivingAlarm: "--",
                weeklyDriveAlert: "--", weeklyDriveAlarm: "--",
                weeklyRestAlert: "--", weeklyRestAlarm: "--",
                weeklyWorkAlert: "--", weeklyWorkAlarm: "--",
                dailyWorkAlert: "--", dailyWorkAlarm: "--",
                continuousDriveAlert: "--", continuousDriveAlarm: "--",
                harshBrakingAlert: "--", harshBrakingAlarm: "--",
                harshAccelerationAlert: "--", harshAccelerationAlarm: "--",
                phoneCall: "--", smoking: "--", seatBelt: "--", fatigue: "--", distraction: "--",
                "Distance totale Parcouru sur la période": "--",
                "Durée de Conduite sur la période": "--",
                "Ratio": "--"
            });
        }
    });

    // === 11. Trier les actifs : ratio croissant, puis durée décroissante
    activeResults.sort((a, b) => {
        if (a.Ratio !== b.Ratio) return a.Ratio - b.Ratio;
        return b["Durée de Conduite sur la période"] - a["Durée de Conduite sur la période"];
    });

    // === 12. Ajouter le classement
    activeResults.forEach((r, i) => r.Ranking = i + 1);
    inactiveResults.forEach((r, i) => r.Ranking = activeResults.length + 1 + i);

    const allResults = [...activeResults, ...inactiveResults];

    // === 13. Formatage de la durée
    function formatDuration(hours) {
        if (hours === "--") return "--";
        const totalSeconds = Math.floor(hours * 3600);
        const days = Math.floor(totalSeconds / 86400);
        const h = Math.floor((totalSeconds % 86400) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${days}Jrs ${String(h).padStart(2, '0')}H ${String(m).padStart(2, '0')}Min ${String(s).padStart(2, '0')}Sec`;
    }

    // === 14. Générer detailedResults
    const detailedResults = allResults.map(r => ({
        Driver: r.Driver,
        "Nombres d'Alertes Conduite de nuit": r.nightDrivingAlert,
        "Nombres d'Alarme Conduite de nuit": r.nightDrivingAlarm,
        "Nombres d'Alertes conduite hebdomadaire": r.weeklyDriveAlert,
        "Nombres d'Alarme conduite hebdomadaire": r.weeklyDriveAlarm,
        "Nombres d'Alertes Repos hebdomadaire": r.weeklyRestAlert,
        "Nombres d'Alarme Repos hebdomadaire": r.weeklyRestAlarm,
        "Nombres d'Alertes Travail hebdomadaire": r.weeklyWorkAlert,
        "Nombres d'Alarme Travail hebdomadaire": r.weeklyWorkAlarm,
        "Nombres d'Alertes Travail journalier": r.dailyWorkAlert,
        "Nombres d'Alarme Travail journalier": r.dailyWorkAlarm,
        "Nombres d'Alertes Conduite continue": r.continuousDriveAlert,
        "Nombres d'Alarme Conduite continue": r.continuousDriveAlarm,
        "Nombres d'Alertes HB": r.harshBrakingAlert,
        "Nombres d'Alarme HB": r.harshBrakingAlarm,
        "Nombres d'Alertes HA": r.harshAccelerationAlert,
        "Nombres d'Alarme HA": r.harshAccelerationAlarm,
        "Nombres de Téléphone au volant": r.phoneCall,
        "Nombres de smoking": r.smoking,
        "Nombres de Ceinture de Sécurité": r.seatBelt,
        "Nombres de fatigues": r.fatigue,
        "Nombres de distraction": r.distraction,
        "Nombre totale de points perdu sur la période": r.points,
        "Distance totale Parcouru sur la période (km)": r["Distance totale Parcouru sur la période"],
        "Durée de Conduite sur la période": formatDuration(r["Durée de Conduite sur la période"]),
        "Durée de Conduite sur la période en heure": r["Durée de Conduite sur la période"],
        "Ratio": r.Ratio,
        "Ranking": r.Ranking
    }));

    // === 15. Classement simplifié
    const rankingOnly = allResults.map(r => ({
        Ranking: r.Ranking,
        Driver: r.Driver,
        "Nombre de points perdus au 100km": (r.Ratio === 0 || parseFloat(r.Ratio)) ? r.Ratio * 100 : '--',

    }));

    return { detailedResults, rankingOnly };
}
module.exports = { analyzeDrivers }
