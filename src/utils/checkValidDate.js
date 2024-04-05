function isValidDate (str) {
  let [y,M,d,h,m,s] = str.split(/[- : T Z]/);
  return (y && M <= 12 && d <= 31 && h<=23 && m<=60 && s<=60) ? true : false;

}

module.exports={isValidDate}