const TOKEN = process.env.TOKEN
const TOTAL_TOKEN = process.env.TOTAL_TOKEN
const BASE_URL = process.env.BASE_URL
const YMANE_BASE_URL = process.env.YMANE_BASE_URL
const YMANE_TOTAL_TOKEN = process.env.YMANE_TOTAL_TOKEN
const YMANE_TOTAL_TOKEN_MADA = process.env.YMANE_TOTAL_TOKEN_MADA

module.exports = {
  devconfig: {
    token: TOKEN,
    baseUrl: BASE_URL,
    totalToken: TOTAL_TOKEN,
    totalYmaneBaseUrl: YMANE_BASE_URL,
    ymaneToken: YMANE_TOTAL_TOKEN,
    ymaneTokenMada: YMANE_TOTAL_TOKEN_MADA
  }
}