const mongoose = require('mongoose');
const { Schema } = mongoose;

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

UserSchema.index({ location: '2dsphere' }); // Index for geospatial queries

module.exports = mongoose.model('User', UserSchema);
