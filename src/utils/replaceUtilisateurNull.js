function utilisateurNullEcodriving(arr){
    const data = arr.map(item=>{
        if(item.Conducteur===''){
            return {
                Grouping:item.Grouping,
                Affectations:item.Affectations,
                Conducteur: '---',
                Infraction:item.Infraction,
                Valeur: item.Valeur,
                Début: item['Début'],
                "Emplacement initial": item['Emplacement initial'],
                Fin: item['Fin'],
                "Lieu d'arrivée":item["Lieu d'arrivée"],
                "Vitesse maxi": item['Vitesse maxi'],
                'Violation duration': item['Violation duration'],
                Kilométrage: item['Kilométrage'],
   
             }
        }else{
            return item
        }
    })

    return data;
}

function utilisateurNullDetailTrajet(arr){
    const data = arr.map(item=>{
        if(item.Conducteur===''){
            return {
                Grouping:item.Grouping,
                Affectations:item.Affectations,
                Conducteur: '---',
                Début: item['Début'],
                'Lieu de Départ': item['Lieu de Départ'],
                 Fin:item.Fin,
                "Lieu d'arrivée":item["Lieu d'arrivée"],
                 Durée: item['Durée'],
                'En mouvement':item['En mouvement'],
                'Ralenti moteur':item['Ralenti moteur'],
                 Distance: item.Distance,
                'Temps total': item['Temps total'],
                 Arrêts: item['Arrêts'],
                'Vitesse maxi': item['Vitesse maxi'],
             }
        }else{
            return item
        }
    })

    return data;
}


function utilisateurNullConduiteDeNuit(arr){
    const data = arr.map(item=>{
        if(item && item.Conducteur===''){
            return {
                Grouping:item.Grouping,
                Affectations:item.Affectations,
                Conducteur: '---',
                'Début': item['Début'],
                'Lieu de Départ':item['Lieu de Départ'],
                Fin:item.Fin,
                "Lieu d'arrivée": item[ "Lieu d'arrivée"],
                'Durée':item['Durée'],
                'En mouvement':item['En mouvement'],
                'Ralenti moteur': item['Ralenti moteur'],
                Distance: item.Distance,
                'Vitesse maxi':item['Vitesse maxi'],
             }
        }else{
            return item
        }
    })

    return data;
}

function utilisateurNullExcesVitess(arr){
    const data = arr.map(item=>{
        if(item.Conducteur===''){
            return {
                Grouping:item.Grouping,
                Affectations:item.Affectations,
                Conducteur: '---',
                'Date et heure': item['Date et heure'],
                Lieu: item.Lieu,
                'Vitesse maxi': item['Vitesse maxi'],
                'Durée': item['Durée']
             }
        }else{
            return item
        }
    })

    return data;
}



module.exports={utilisateurNullEcodriving,utilisateurNullDetailTrajet,utilisateurNullConduiteDeNuit,utilisateurNullExcesVitess}