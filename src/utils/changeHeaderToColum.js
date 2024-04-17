function changeHeaderToColum(arr){
    const colum=arr.map(item=>{
        return {key:item}
      })
    return colum;  
}


module.exports={changeHeaderToColum}