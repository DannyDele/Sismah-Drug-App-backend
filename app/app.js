
const express = require('express');
const bodyParser = require('body-parser');
const morgan  = require('morgan')
// const corsOptions = require('../config/corsOptions')
const cors = require('cors');
const userRoute = require('../routes/v1/user/user');
const pharmacyRoute = require('../routes/v1/pharmacy/pharmacy');
const userProfileImageUploadRoute = require('../routes/v1/fileUpload/profileImage')

// initialize the express app
const app = express();

// morgan logger
app.use(morgan('dev'))

//set up bodyparser
app.use(bodyParser.urlencoded({extended: true})) 
app.use(bodyParser.json()) 
app.use(express.json());
// Use the CORS middleware with the configured options
app.use(cors());


// Routes
app.use('/api/v1', userRoute);
app.use('/api/v1', pharmacyRoute);

app.use('/', userProfileImageUploadRoute)

app.use('/home', (req, res) => {
    res.send('Home Page')
});


// Error Handle Middleware
app.use((err, req, res, next) => {
  const { message = 'something went wrong', status = 500 } = err;
  res.status(status).send({ msg: message });
  console.log(err)
});


module.exports = app;
