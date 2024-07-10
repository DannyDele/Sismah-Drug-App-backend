const express = require('express');
const router = express.Router();
const { createPharmacy, verifyOTP, signInpPharmacy } = require('../../../controller/pharmacy/auth/pharmacyAuthController');
const {createStore} = require('../../../controller/pharmacy/functions/pharmacyFuncController')
// const {getAuser, getNearbyPharmacies} = require('../../../controller/user/functions/userFunController') 

// user authentication routes
router.post('/pharmacy', createPharmacy);
router.post('/verify-otp', verifyOTP);
router.post('/pharmacy/:pharmacyId/store', createStore)
// router.post('/pharmacy/sign-in', signInpPharmacy);



module.exports = router;



