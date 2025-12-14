const { formatToLocalTime } = require('./dateFormat')
const { isValidDate } = require('./checkValidDate')


function changePropertiesDateTOLocal(objects) {
  return objects.map((object) => {
    const obj = { ...object };
    Object.keys(obj).forEach((property) => {
      let item = obj[property];
      if (typeof item === 'object' && item !== null && item.text) {
        if (isValidDate(item.text)) {
          obj[property] = {
            ...item,
            text: formatToLocalTime(item.text)
          };
        }
      } else if (typeof item === 'string') {
        if (isValidDate(item)) {
          obj[property] = formatToLocalTime(item);
        }
      }
    });
    return obj;
  });
}

module.exports = { changePropertiesDateTOLocal }