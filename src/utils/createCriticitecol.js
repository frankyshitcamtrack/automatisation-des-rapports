const {jsonstring}=require('../utils/convertArrToString');
const {convertArrToJson}=require('../utils/convertArrToJson');
const {removeDuplicates}=require('../utils/removeDuplicateItemInArr');


function  addCriticiteAndVitesseLimiteProps(arr){
  const filter= arr.filter(item=>{
    const date =item['Durée'].split(':');
    const sec =parseInt(date[2]);
    const min= parseInt(date[1]);
    return (sec>=21 || min>0) ;
})

const stringArr = jsonstring(filter);
const removeDuplicateItem = removeDuplicates(stringArr);
const jsonArr= convertArrToJson(removeDuplicateItem);


const props= jsonArr.map(item=>{
  if((parseInt(item['Vitesse maxi'].text)>60 && parseInt(item['Vitesse maxi'].text)<81)){
      return  {
           ...item,
           'Vitesse limite':'entre 61 km/h et 80 km/h',
           Criticité:'Légère',    
    }
  }

  if(parseInt(item['Vitesse maxi'].text)>80){
      return  {
          ...item,
          'Vitesse limite':"plus de 81 km/h",
           Criticité:'Sévère',
    }
  }
})

return props;
}


function addCriticiteProps(arr){ 
  const filter= arr.filter(item=>{
    const date =item['Durée'].split(':');
    const sec =parseInt(date[2]);
    const min= parseInt(date[1]);
    return (sec>=21 || min>0) ;
})

const stringArr = jsonstring(filter);
const removeDuplicateItem = removeDuplicates(stringArr);
const jsonArr= convertArrToJson(removeDuplicateItem);


const props= jsonArr.map(item=>{
    if(item["Zone d'exces de vitesse"]==="VILLE" && (parseInt(item['Vitesse maxi'].text)>60 && parseInt(item['Vitesse maxi'].text)<81)){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'VILLE',
            Criticité:'Légère',
            'Date et heure': {text:item['Date et heure'].text,hyperlink:item['Date et heure'].hyperlink},
            Lieu:{text:item.Lieu.text, hyperlink:item.Lieu.hyperlink} ,
            'Vitesse maxi':{text:item['Vitesse maxi'].text,hyperlink:item['Vitesse maxi'].hyperlink},
            'Durée': item['Durée']
      }
    }

    if(item["Zone d'exces de vitesse"]==="VILLE" && parseInt(item['Vitesse maxi'].text)>80){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'VILLE',
            Criticité:'Sévère',
            'Date et heure': {text:item['Date et heure'].text,hyperlink:item['Date et heure'].hyperlink},
            Lieu:{text:item.Lieu.text, hyperlink:item.Lieu.hyperlink} ,
            'Vitesse maxi':{text:item['Vitesse maxi'].text,hyperlink:item['Vitesse maxi'].hyperlink},
            'Durée': item['Durée']
      }
    }

    if(item["Zone d'exces de vitesse"]==="HORS VILLE" && (parseInt(item['Vitesse maxi'].text)>110 && parseInt(item['Vitesse maxi'].text)<121)){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'HORS VILLE',
            Criticité:'Légère',
            'Date et heure': {text:item['Date et heure'].text,hyperlink:item['Date et heure'].hyperlink},
            Lieu:{text:item.Lieu.text, hyperlink:item.Lieu.hyperlink} ,
            'Vitesse maxi':{text:item['Vitesse maxi'].text,hyperlink:item['Vitesse maxi'].hyperlink},
            'Durée': item['Durée']
      }
    }

    if(item["Zone d'exces de vitesse"]==="HORS VILLE" && parseInt(item['Vitesse maxi'].text)>120){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'HORS VILLE',
            Criticité:'Sévère',
            'Date et heure': {text:item['Date et heure'].text,hyperlink:item['Date et heure'].hyperlink},
            Lieu:{text:item.Lieu.text, hyperlink:item.Lieu.hyperlink} ,
            'Vitesse maxi':{text:item['Vitesse maxi'].text,hyperlink:item['Vitesse maxi'].hyperlink},
            'Durée': item['Durée']
      }
    }


    if(item["Zone d'exces de vitesse"]==="Nat 3" && (parseInt(item['Vitesse maxi'].text)>80 && parseInt(item['Vitesse maxi'].text)<101)){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'Nat 3',
            Criticité:'Légère',
            'Date et Heure': {text:item['Date et heure'].text,hyperlink:item['Date et heure'].hyperlink},
            Lieu:{text:item.Lieu.text, hyperlink:item.Lieu.hyperlink} ,
            'Vitesse maxi':{text:item['Vitesse maxi'].text,hyperlink:item['Vitesse maxi'].hyperlink},
            'Durée': item['Durée']
      }
    }
    
    if(item["Zone d'exces de vitesse"]==="Nat 3" && parseInt(item['Vitesse maxi'].text) >100){
        return  {
            Grouping:item.Grouping,
            Affectations:item.Affectations,
            Conducteur: item.Conducteur,
            "Zone d'exces de vitesse":'Nat 3',
            Criticité:'Sévère',
            'Date et Heure': {text:item['Date et heure'].text,hyperlink:item['Date et heure'].hyperlink},
            Lieu:{text:item.Lieu.text, hyperlink:item.Lieu.hyperlink} ,
            'Vitesse maxi':{text:item['Vitesse maxi'].text,hyperlink:item['Vitesse maxi'].hyperlink},
            'Durée': item['Durée']
      }
    }
  })


  
  return props;
}

module.exports={addCriticiteProps,addCriticiteAndVitesseLimiteProps}