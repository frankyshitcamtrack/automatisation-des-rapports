function isValidDate (str) {
    // optional condition to eliminate the tricky ones
    // since chrome will prepend zeros (000...) to the string and tconst isDate = str => {
      let [y,M,d,h,m,s] = str.split(/[- : T Z]/);
      return (y && M <= 12 && d <= 31) ? true : false;
}


module.exports={isValidDate}