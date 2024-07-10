const express = require('express');
const router = express.Router();
const { createUser, verifyOTP, signInUser } = require('../../../controller/user/auth/userAuthController');
const {getAuser, getNearbyPharmacies} = require('../../../controller/user/functions/userFuncController') 

// user authentication routes
router.post('/user', createUser);
router.post('/verify-otp', verifyOTP);
router.post('/user/sign-in', signInUser);


// user fucntion routes
// router.get('/nearby-stores/:userId', getNearbyPharmacies);
router.get('/user/:id', getAuser);



module.exports = router;



