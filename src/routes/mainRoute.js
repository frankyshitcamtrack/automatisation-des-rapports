const express = require('express')

const router = express.Router()

const {generateDaylyRepportPerenco}=require('../controllers/perenco.controllers')

//router.get('/perenco',generateDaylyRepportPerenco)


module.exports= router