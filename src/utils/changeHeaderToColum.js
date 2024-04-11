function changeHeaderToColum(arr){
    const colum=arr.map(item=>{
        return {key:item,header:item}
      })
    return colum;  
}


module.exports={changeHeaderToColum}