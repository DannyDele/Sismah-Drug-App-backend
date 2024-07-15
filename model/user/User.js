const mongoose = require('mongoose');
const { Schema } = mongoose;
const crypto = require('crypto');


const UserSchema = new Schema({
    userId: {
        type: String,
        unique: true
    },
    firstName:
    {
        type: String,
        required: true
    },
    lastName:
    {
        type: String,
        required: true
    },
    username:
    {
        type:String,
        required: true
    },
    age: {
        type: String
    },
    email:
    {
        type:String,
        required: true,
        unique: true
    },
    phoneNumber:
    {
        type:String,
        required: true,
        unique: true
    },
     profileImage: {
        type: String, // Store the image path or URL
    },
    password:
    {
        type: String,
        required: true
    },
    role:
    {
        type: String,
        enum: ['user', 'admin', 'super-admin'],
        required: true
    },
    userType:
    {
        type: String,
        enum: ['public-user', 'pharmacy', 'rider'],
    },

     otp:
    {
         type: String,
         unique: true

    },
     otpVerification:
    {
         type: Boolean,
         default:false

    },
     otpExpires:
    {
         type: String,
         unique: true

    },
     
    passwordResetToken: {
        type: String   
       },
    passwordChangedAt: {
        type: Date
    },    
    passwordResetTokenExpires: {
      type: Date
  },
    
    
    // store user location coordinates for geolocation
    location:
    {
      type: {
          type: String,
          enum: ['Point'],
      },
      coordinates:
      {
          type: [Number], 
      }
  }
},
    {
        timestamps: true
    });




// class method function to reset a users password
UserSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.passwordResetToken);
    return resetToken;
}

UserSchema.methods.isPasswordChanged = async function (JWTtimeStamp) {
  if (this.passwordChangedAt) {
    const pswdChangedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(pswdChangedTimeStamp, JWTtimeStamp);

    return JWTtimeStamp < pswdChangedTimeStamp;
  }
  return false
}



UserSchema.index({ location: '2dsphere' }); // Index for geospatial queries

module.exports = mongoose.model('User', UserSchema);
