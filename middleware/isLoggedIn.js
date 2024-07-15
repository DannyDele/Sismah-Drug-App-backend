const util = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/user/User');
const HandleAsync = require('../utils/HandleAsync');
const AppError = require('../utils/AppError');



const isLoggedIn = HandleAsync(async (req, res, next) => {

  // read the token a check if it exist
 const token = req.headers.Authorization || req.headers.authorization; // Check for both cases

let accessToken;

if (token && token.toLowerCase().startsWith('bearer')) { // Convert to lowercase before checking
  accessToken = token.split(' ')[1];
}

  if (!accessToken) {
    return next(new AppError('You need to be logged in first', 401));
  }

  try {
     // Validate the token
    const decodedAccessToken = await util.promisify(jwt.verify)(accessToken, process.env.ACCESS_TOKEN_SECRET);  
    console.log('Decoded Access Token:', decodedAccessToken);
    


 // Check if the token has expired
    if (Date.now() >= decodedAccessToken.exp * 1000) {
      return next(new AppError('Token has expired', 401));
    }


    // check if the user still exist
    const user = await User.findOne({ userId: decodedAccessToken.id });
    console.log('Found user', user);
    
    if (!user) {
      return next(new AppError('The user with that token does not exist', 401));
    }

    // If the user changed password after the token was issued
    const isPasswordChanged = user.isPasswordChanged(decodedAccessToken.iat)

    if (await isPasswordChanged ) {
      return next(new AppError('The password has been changed recently. Please login again', 401))
    }

    // Allow user access to route
    req.user = user;
    next();

  } catch (err) {
    next(err)
      console.log('Error verifying token:', err);

     // Handle JWT errors
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired', 401));
    } else if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
      console.log('Error verifying token:', err);
    } 
  });

module.exports = { isLoggedIn };