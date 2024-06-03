function addIntervalles(arr) {

    const props = arr.map(item => {

        if(item){
            const debut = item['Début'];
            const hour = parseInt(debut.split(' ')[1].split(':')[0]);
            const minutes =parseInt(debut.split(' ')[1].split(':')[2])

            if (hour > 21 || (hour <=24  && minutes<=0)) {
                return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    Intervalles: "22H-24H",
                    'Début': item['Début'],
                    'Lieu de Départ': item['Lieu de Départ'],
                    Fin: item.Fin,
                    "Lieu d'arrivée": item["Lieu d'arrivée"],
                    'Durée': item['Durée'],
                    'En mouvement': item['En mouvement'],
                    'Ralenti moteur': item['Ralenti moteur'],
                    Distance: item.Distance,
                    'Vitesse maxi': item['Vitesse maxi']
                }
            }
            
            if ((hour >= 24 && minutes>0 ) || hour <=4) {
                return {
                    Grouping: item.Grouping,
                    Affectations: item.Affectations,
                    Conducteur: item.Conducteur,
                    Intervalles: "24H-04H",
                    'Début': item['Début'],
                    'Lieu de Départ': item['Lieu de Départ'],
                    Fin: item.Fin,
                    "Lieu d'arrivée": item["Lieu d'arrivée"],
                    'Durée': item['Durée'],
                    'En mouvement': item['En mouvement'],
                    'Ralenti moteur': item['Ralenti moteur'],
                    Distance: item.Distance,
                    'Vitesse maxi': item['Vitesse maxi']
                }
            }

        }
          

    })
 
    return props;
}

module.exports = { addIntervalles }