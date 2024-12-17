function replaceProps(arr, initProps, newProps) {
  return arr.map((item) => {
    let keys = Object.keys(item);
    keys.forEach((k) => {
      if (k === initProps) {
        item[newProps] = item[k];
        delete item[k];
      }
    });
    return item;
  });
}

module.exports = { replaceProps };
