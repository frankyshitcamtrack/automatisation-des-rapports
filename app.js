require('dotenv').config();
const morgan = require("morgan");
const cors = require("cors");
const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const {generalControllers} =require('./src/controllers/general.controllers');
const {getCotcoData,getVehiculeDescription}=require('./src/models/mzone.models');
const {getCimencamData} = require ('./src/models/cimencam.models');
const routes = require('./src/routes/mainRoute');




const app = express();

// Sets server port and logs message on success
app.listen(process.env.PORT || 8080, () => console.log("app is listening to port 8080 "));


app.use(morgan('combined'));

app.use(cors());
app.use(bodyParser.json());

//generatStyleDoc();

async function run(){
 //await getCimencamData();
 await generalControllers();
 //await getCotcoData()
 //await getVehiculeDescription( '17ba8528-8215-473e-9728-39867b5da893');
} 

app.use("/", routes);

run();
 

app.use(express.static(path.join(__dirname,'..','rapport')));








