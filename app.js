require('dotenv').config();
const morgan = require("morgan");
const cors = require("cors");
const path = require('path');

const express = require("express");
const bodyParser = require("body-parser");
const {generateReportGlobal}= require('./src/services/services')

const app = express();

// Sets server port and logs message on success
app.listen(process.env.PORT || 8080, () => console.log("app is listening"));


app.use(morgan('combined'));

app.use(cors());
app.use(bodyParser.json());

generateReportGlobal("admin guinness","Speedings","GUINNESS(TRANSAPORTEUR)",1708918215,1711423815);

//vehicleRessourceId("admin ADDAX");

//vehicleTemplateId("ECO DRIVING Report ADDAX","admin ADDAX"); 

//vehicleGroupRessourceId("ADDAX PETROLEUM");

app.use(express.static(path.join(__dirname,'..','public')));








