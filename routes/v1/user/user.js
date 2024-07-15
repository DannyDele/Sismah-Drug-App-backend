const express = require('express');
const router = express.Router();
const { createUser, verifyOTP, signInUser } = require('../../../controller/user/auth/userAuth');
const {isLoggedIn} =  require('../../../middleware/isLoggedIn')
const { getAuser, updateUser, getNearbyStores, forgotPassword, resetPassword } = require('../../../controller/user/functions/userFunc');

// User authentication routes
router.route('/user')
    .post(createUser);

router.route('/verify-otp')
    .post(verifyOTP);

router.route('/forgot-password')
    .post(forgotPassword);

router.route('/reset-password/:token')
    .post(resetPassword);

router.route('/user/sign-in')
    .post(signInUser);

// User function routes
// router.get('/user/:userId', isLoggedIn, getAuser);


router.route('/user/:userId')
     .get(isLoggedIn, getAuser)
    .patch(updateUser);

router.route('/user/:userId/nearby-pharmacies')
    .get(getNearbyStores);

module.exports = router;
