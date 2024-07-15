const express = require('express');
const User = require('../../../model/user/User');
const Pharmacy = require('../../../model/pharmacy/Pharmacy'); 
const Store = require('../../../model/pharmacy/Store');
const Product = require('../../../model/pharmacy/Product');
const HandleAsync = require('../../../utils/HandleAsync');
const AppError = require('../../../utils/AppError');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const signToken = require('../../../utils/SignToken');
const { sendPasswordResetMail } = require('../../../services/NodeMailer')






// function to get a user
const getAuser = HandleAsync(async (req, res, next) => {
  try {
    const { userId } = req.params;
      const user = await User.findOne({ userId });
    if (!user) {
        // return res.status(404).json({ error: 'User not found!' });
          return next(new AppError('User not found!', 404))


    }
    res.status(200).json({ msg: 'user found!', data: [user] });
  } catch (err) {
    next(err); // Pass the error to the next error handler
    console.error('Server error:', err);
  }
    
});


// Function to update a user
const updateUser = HandleAsync(async (req, res, next) => {
  const { userId } = req.params;
  const updates = req.body;


  try {
    const user = await User.findOneAndUpdate({ userId }, updates, {new: true});

    if (!user) {
      // return res.status(404).json({ error: 'User not found!' });
      return next(new AppError('User not found!', 404));

    }
 
         console.log('Updated user:', user);

    // // save users update
    // await user.save();

    res.status(200).json({ msg: 'User updated successfully!', data: [user] });
  } catch (err) {
    next(err); // Pass the error to the next error handler
    console.error('Server error:', err);
  }
});





// function to get nearby stores for user
const getNearbyStores = HandleAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { lon, lat } = req.query;

    try {
        // First, update the user's location
        await User.findOneAndUpdate({ userId }, {
            location: {
                type: 'Point',
                coordinates: [parseFloat(lon), parseFloat(lat)]
            }
        });

        // Then, find nearby pharmacies
        const nearbyStores = await Store.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lon), parseFloat(lat)]
                    },
                    $maxDistance: 20000 // 20km in meters
                }
            }
        });

        if (nearbyStores.length === 0) {
          return next(new AppError('There are no pharmacies near your current location', 404));
        }

        res.status(200).json({ msg: 'found stores!', data: nearbyStores });
    } catch (err) {
        // Pass the error to the next error handler
        next(err);
    }
});





// Function to send Forgot password link to the users mail for password change

const forgotPassword = HandleAsync(async (req, res, next) => {

  try {
       const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // res.status(404).json({ msg: "User with this email does not exist" });
    return next(new AppError('User with this email does not exist', 404));
  }

    const resetToken = user.createResetPasswordToken();
    await user.save({validateBeforeSave: false});
    // const resetUrl = `https://api.netproxim.com/reset-password/${resetToken}`
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`
  
    
  
   // // Send reset password link to users mail
await sendPasswordResetMail(
  user.email,
  'Your Password Reset Link',
  `You have recieved a Password Reset link. Please use the below link to reset your password <br>
    ${resetUrl} <br> Note: This reset password link will be valid for only 10min.`,
  `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <h1 style="text-align: center; color: #4CAF50;">MyMedics</h1>
      <p>Dear ${user.firstName},</p>
      <p>You have received a password reset link. Please use the button below to reset your password. This reset password link will be valid for only 10 minutes.</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
      <p>Thank you,<br>MyMedics Team</p>
    </div> `,
    user

);


    
    res.status(200).json({ message: 'Password Reset Link Sent' });

  }
  catch (err) {
    next(err);
    console.log('Server error:', err);
  }

  
  });






  // Function to reset users password
const resetPassword = HandleAsync(async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;
    const token = req.params.token;

    if (!token) {
      return next(new AppError('Token is missing from the request', 400));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Hashed Token:', hashedToken);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() }
    });
    console.log('User info:', user);

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 404));
    }

    if (password !== confirmPassword) {
      return next(new AppError('Password and confirmPassword do not match', 403));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();
    console.log(`Updated user: ${user}`);

    const loginToken = signToken(user.userId, user.role);

    res.status(200).json({ msg: 'Password changed successfully!', login_token: loginToken });
  } catch (err) {
    next(err);
    console.log('Server error:', err);
  }
});





module.exports = {
  getAuser,
  updateUser,
  getNearbyStores,
  forgotPassword,
  resetPassword,
};