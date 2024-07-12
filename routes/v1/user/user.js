const express = require('express');
const router = express.Router();
const { createUser, verifyOTP, signInUser } = require('../../../controller/user/auth/userAuth');
const {getAuser, updateUser, getNearbyStores} = require('../../../controller/user/functions/userFunc') 

// user authentication routes
router.post('/user', createUser);
router.post('/verify-otp', verifyOTP);
router.post('/user/sign-in', signInUser);


// user fucntion routes
// router.get('/nearby-stores/:userId', getNearbyPharmacies);
router.get('/user/:userId', getAuser);
router.get('/user/:userId/nearby-pharmacies', getNearbyStores);
router.patch('/user/:userId', updateUser);


module.exports = router;



