const express = require('express');
const User = require('../../../model/user/User');
const Store = require('../../../model/pharmacy/Store');
const HandleAsync = require('../../../utils/HandleAsync')
// const Pharmacy = require('../models/Pharmacy'); // Assuming you have a Pharmacy model







// function to get a user
const getAuser = HandleAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ msg:'user not found!'})
        }
            res.status(200).json({msg:'user found!', data: [user]})
    } catch (err) {
       res.status(500).json({ error: 'Server error', err });
        console.error('Server error:', err);    }
    
})





// // function to get nearby stores for user
const getNearbyStores = HandleAsync(async (req, res) => {
     const { userId } = req.params;
  const { lat, lon } = req.query;

   try {
    // First, update the user's location
    await User.findByIdAndUpdate(userId, {
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

    res.status(200).json({msg:'found stores!', data: [nearbyStores]});
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});


module.exports = {
    getAuser,
    // getNearbyStores
};