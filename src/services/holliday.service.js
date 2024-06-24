 const axios = require('axios');

const calenderKey=process.env.GOOGLE_CALENDER_KEY;

const url =`https://www.googleapis.com/calendar/v3/calendars/en.cm%23holiday%40group.v.calendar.google.com/events?year=2024&key=${calenderKey}`;

async function getHollydaysCameroun() {
   const hollydays= await axios.get(url).then((res)=>{
       return  res.data.items;
   }).catch(err => console.log(err));
   return hollydays;
}
    



module.exports = {getHollydaysCameroun}