
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const AppError = require('../utils/AppError');
// const corsOptions = require('../config/corsOptions')
const cors = require('cors');
const superAdminRoute = require('../routes/v1/Super-Admin/supAdmin');
const userRoute = require('../routes/v1/user/user');
const pharmacyRoute = require('../routes/v1/pharmacy/pharmacy');
const dispatchCompanyRoute = require('../routes/v1/dispatchCompany/dispatchCompany');
const userProfileImageUploadRoute = require('../routes/v1/fileUpload/profileImage');

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


// super admin routes
app.use('/api/v1', superAdminRoute);



// user routes
app.use('/api/v1', userRoute);
app.use('/api/v1', userProfileImageUploadRoute)


// pharmacy routes
app.use('/api/v1', pharmacyRoute);


// dispatch company routes
app.use('/api/v1', dispatchCompanyRoute);


app.use('/home', (req, res) => {
    res.send('Home Page')
});




// Catch all undefined routes and forward to error handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


// Global error handling middleware
app.use((err, req, res, next) => {
  const { message = 'something went wrong', status = 500 } = err;
  res.status(status).send({ msg: message });
  console.log(err)
});










// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//     error: err,
//     stack: err.stack
//   });
//   console.error('Error:', err);
// });



module.exports = app;
