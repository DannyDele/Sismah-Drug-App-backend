const express = require('express');
const User = require('../../../model/user/User');
const Pharmacy = require('../../../model/pharmacy/Pharmacy'); 
const Store = require('../../../model/pharmacy/Store');
const Product = require('../../../model/pharmacy/Product');
const HandleAsync = require('../../../utils/HandleAsync');
const AppError = require('../../../utils/AppError');







// function to get a user
const getAuser = HandleAsync(async (req, res, next) => {
  try {
    const { userId } = req.params;
      const user = await User.findOne({ userId });
    if (!user) {
        return res.status(404).json({ error: 'User not found!' });

    }
    res.status(200).json({ msg: 'user found!', data: [user] })
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
      return res.status(404).json({ error: 'User not found!' });
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
            return res.status(404).json({ error: 'There are no pharmacies near your current location' });
        }

        res.status(200).json({ msg: 'found stores!', data: nearbyStores });
    } catch (err) {
        // Pass the error to the next error handler
        next(err);
    }
});



module.exports = {
  getAuser,
  updateUser,
  getNearbyStores
};