const jwt = require('jsonwebtoken');

// Json web token assigned to user function
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.LOGIN_EXPIRES })
}



// function to generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


module.exports = { signToken, generateOtp };