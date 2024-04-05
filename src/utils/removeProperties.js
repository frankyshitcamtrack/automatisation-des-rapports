function removeProperties(arr,props){
    arr.map(item=>{
   const keys= Object.keys(item);
   keys.forEach(k=>{
      if(k===props){
         delete item[k]
      }
   })
   return item;
  })
}

module.exports={removeProperties}