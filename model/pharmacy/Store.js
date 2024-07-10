const mongoose = require('mongoose');
const { Schema } = mongoose;

const storeSchema = new Schema({
    name:
    {
        type: String,
        required: true
    },
   
    address:{

        type: String,
    },
    city: {
          type: String  
      },
    state: {
         type: String  

        },
        postalCode: {
            type: String  

        },
    country: {
         type: String  
        },
    phoneNumber:{
        type:String,
        required: true,
        unique: true
    },

     operatingHours: {
        open: {
            type: String,
            required: true
        },
        close: {
            type: String,
            required: true
        }
    },
    createdBy: {
        type:String
    },

   // store pharmacy store location coordinates for geolocation
    location:
    {
      type: {
          type: String,
          enum: ['Point'],
          required: true
      },
      coordinates:
      {
          type: [Number], 
          required: true
      }
    },
    
 // Reference to the pharmacy
    pharmacy: {
        type: Schema.Types.ObjectId,
        ref: 'Pharmacy',
    }
    
},
    {
        timestamps: true
    });

storeSchema.index({ location: '2dsphere' }); // Index for geospatial queries

module.exports = mongoose.model('Store', storeSchema);
