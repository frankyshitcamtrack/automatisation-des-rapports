const {jsonstring}=require('../utils/convertArrToString');
const {convertArrToJson}=require('../utils/convertArrToJson');
const {removeDuplicates}=require('../utils/removeDuplicateItemInArr');


function addCriticiteProps(arr){ 
  const filter= arr.filter(item=>{
    const date =item['Durée'].split(':');
    const newDate =parseInt(date[2]);
    return newDate>21
})
  
const stringArr = jsonstring(filter);
const removeDuplicateItem = removeDuplicates(stringArr);
const jsonArr= convertArrToJson(removeDuplicateItem);

const props= jsonArr.map(item=>{
    
    if(item["Zone d'exces de vitesse"]==="VILLE" && (parseInt(item['Vitesse maxi'])>60 || parseInt(item['Vitesse maxi'])<81)){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'VILLE',
            Criticité:'Légère',
            'Date et heure': item['Date et heure'],
            Lieu: item.Lieu,
            'Vitesse maxi': item['Vitesse maxi'],
            'Durée': item['Durée']
      }
    }

    if(item["Zone d'exces de vitesse"]==="VILLE" && parseInt(item['Vitesse maxi'])>80){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'VILLE',
            Criticité:'Sévère',
            'Date et heure': item['Date et heure'],
            Lieu: item.Lieu,
            'Vitesse maxi': item['Vitesse maxi'],
            'Durée': item['Durée']
      }
    }

    if(item["Zone d'exces de vitesse"]==="HORS VILLE" && (parseInt(item['Vitesse maxi'])>110 || parseInt(item['Vitesse maxi'])<121)){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'HORS VILLE',
            Criticité:'Légère',
            'Date et heure': item['Date et heure'],
            Lieu: item.Lieu,
            'Vitesse maxi': item['Vitesse maxi'],
            'Durée': item['Durée']
      }
    }

    if(item["Zone d'exces de vitesse"]==="HORS VILLE" && parseInt(item['Vitesse maxi'])>120){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'HORS VILLE',
            Criticité:'Sévère',
            'Date et heure': item['Date et heure'],
            Lieu: item.Lieu,
            'Vitesse maxi': item['Vitesse maxi'],
            'Durée': item['Durée']
      }
    }


    if(item["Zone d'exces de vitesse"]==="Nat 3" && (parseInt(item['Vitesse maxi'])>80 || parseInt(item['Vitesse maxi'])<101)){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'Nat 3',
            Criticité:'Légère',
            'Date et heure': item['Date et heure'],
            Lieu: item.Lieu,
            'Vitesse maxi': item['Vitesse maxi'],
            'Durée': item['Durée']
      }
    }
    
    if(item["Zone d'exces de vitesse"]==="Nat 3" && parseInt(item['Vitesse maxi']) >100){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'Nat 3',
            Criticité:'Sévère',
            'Date et heure': item['Date et heure'],
            Lieu: item.Lieu,
            'Vitesse maxi': item['Vitesse maxi'],
            'Durée': item['Durée']
      }
    }
  })

  return props;
}

module.exports={addCriticiteProps}