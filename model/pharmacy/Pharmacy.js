const mongoose = require('mongoose');
const { Schema } = mongoose;

const PharmacySchema = new Schema({
    pharmacyId:
    {
        type: String,
        unique: true
    },
    name:
    {
        type: String,
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

    state:
    {
        type:String,
    },
    zone:
    {
        type:String,
        required: true,
        unique: true
    },
    city:
    {
        type:String,
        required: true,
        unique: true
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
     
      // Reference to the store
       stores: [
        {
            type: String,
            ref:'Store'
        }
    ],

},
    {
        timestamps: true
    });

PharmacySchema.index({ location: '2dsphere' }); // Index for geospatial queries

module.exports = mongoose.model('Pharmacy', PharmacySchema);
