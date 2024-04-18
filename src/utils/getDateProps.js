function getDate(t){
    const date= new Date(t);
    
    const day=date.getDate();
    const hr=date.getHours();
    const min =date.getMinutes();
    const sec=date.getSeconds();
    const ms=date.getMilliseconds()
    
    return{day,hr,min,sec,ms}
  }


  module.exports={getDate}
  