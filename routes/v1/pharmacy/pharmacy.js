const express = require('express');
const router = express.Router();
const { createPharmacy, verifyOTP, signInpPharmacy } = require('../../../controller/pharmacy/auth/pharmacyAuth');
const { createStore, createProduct, getAllProductCategory } = require('../../../controller/pharmacy/functions/pharmacyFunc');
const { upload } = require('../../../services/fileUpload/productImage(s)');

// Pharmacy authentication routes
router.route('/pharmacy')
    .post(createPharmacy);

router.route('/verify-otp')
    .post(verifyOTP);

// Pharmacy function routes
router.route('/pharmacy/product/categories')
    .get(getAllProductCategory);

router.route('/pharmacy/:pharmacyId/store')
    .post(createStore);

router.route('/store/:storeId/product/:categoryId')
    .post(upload, createProduct);

// Optionally, you can still define routes individually like this:
// router.post('/pharmacy/sign-in', signInpPharmacy);

module.exports = router;
