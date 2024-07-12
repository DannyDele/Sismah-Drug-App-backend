const express = require('express');
const router = express.Router();
const { createPharmacy, verifyOTP, signInpPharmacy } = require('../../../controller/pharmacy/auth/pharmacyAuth');
const { createStore, createProduct } = require('../../../controller/pharmacy/functions/pharmacyFunc');
const { upload } = require('../../../services/fileUpload/productImage(s)');

// const {getAuser, getNearbyPharmacies} = require('../../../controller/user/functions/userFunController') 

// pharmacy authentication routes
router.post('/pharmacy', createPharmacy);
router.post('/verify-otp', verifyOTP);





// pharmacy function routes
router.post('/pharmacy/:pharmacyId/store', createStore);
router.post('/store/:storeId/product', upload, createProduct);
// router.post('/pharmacy/sign-in', signInpPharmacy);



module.exports = router;



