function zoneExcesDeVitesse(arr,title){  
   const items= arr.map(item=>{
       if(title.includes('Légère ville') || title.includes('Sévère ville') ){
          return {
                Grouping:item.Grouping,
                Affectations:item.Affectations,
                Conducteur: item.Conducteur,
                "Zone d'exces de vitesse":'VILLE',
                'Date et heure': item['Date et heure'],
                Lieu: item.Lieu,
                'Vitesse maxi': item['Vitesse maxi'],
                'Durée': item['Durée']
          }
       }

       if(title.includes('Légère Hors ville') || title.includes('Sévère Hors ville')){
        return {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'HORS VILLE',
            'Date et heure': item['Date et heure'],
            Lieu: item.Lieu,
            'Vitesse maxi': item['Vitesse maxi'],
            'Durée': item['Durée']
      }
       }

       if(title.includes('Nat3')){
        return {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'Nat 3',
            'Date et heure': item['Date et heure'],
            Lieu: item.Lieu,
            'Vitesse maxi': item['Vitesse maxi'],
            'Durée': item['Durée']
      }
       }
   });

    return items;
  }
  
  module.exports={zoneExcesDeVitesse}