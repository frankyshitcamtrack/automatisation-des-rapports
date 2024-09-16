const TOKEN = process.env.MZONE_TOKEN
const CIMENCAM_TOKEN = process.env.MZONE_TOKEN_CIMENCAM
const BASE_URL = process.env.MZONE_BASE_URL


module.exports ={
    devconfig:{
      token:TOKEN,
      baseUrl:BASE_URL,
      cimencamToken:CIMENCAM_TOKEN
    }
}