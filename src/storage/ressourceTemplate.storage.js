const {vehicleTemplateRessource}=require('../services/services');

/* [
    {
      i: 15233151,
      d: {
        nm: 'admin client',
        cls: 3,
        id: 15233151,
        mu: 0,
        rep: [Object],
        uacl: 1342194211
      },
      f: 8193
    },
    {
      i: 15244066,
      d: {
        nm: 'admin guinness',
        cls: 3,
        id: 15244066,
        mu: 0,
        rep: [Object],
        uacl: 1342194211
      },
      f: 8193
    },
    {
      i: 15742013,
      d: {
        nm: 'carburant can',
        cls: 3,
        id: 15742013,
        mu: 0,
        rep: [Object],
        uacl: 1342194211
      },
      f: 8193
    },
    {
      i: 23492979,
      d: {
        nm: 'Admin PERENCO',
        cls: 3,
        id: 23492979,
        mu: 0,
        rep: [Object],
        uacl: 1342194211
      },
      f: 8193
    },
    {
      i: 24896025,
      d: {
        nm: 'admin GLOBELEQ',
        cls: 3,
        id: 24896025,
        mu: 0,
        rep: [Object],
        uacl: 1342194211
      },
      f: 8193
    },
    {
      i: 25843454,
      d: {
        nm: 'Admin Guinness',
        cls: 3,
        id: 25843454,
        mu: 0,
        rep: {},
        uacl: 1342194211
      },
      f: 8193
    },
    {
      i: 26087282,
      d: {
        nm: 'admin ADDAX',
        cls: 3,
        id: 26087282,
        mu: 0,
        rep: [Object],
        uacl: 1342194211
      },
      f: 8193
    }
  ] */



async function getRessourceTemplate() {
    const ressourceTemplate = await vehicleTemplateRessource()
        .then(res =>res.data);

    return ressourceTemplate;
}



module.exports={getRessourceTemplate}