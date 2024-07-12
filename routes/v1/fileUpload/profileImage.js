// routes/usersRoutes.js
const express = require('express');
const router = express.Router();
const { UserFile } = require('../../../controller/fileUpload/profileImage');
const { userProfileImageUpload } = require('../../../services/fileUpload/profileImage');


// POST endpoint for profile image upload for public users and pharmacies
// public user profile image upload route
router.patch('/file/upload/:userId', userProfileImageUpload, UserFile);


// pharmacy profile image upload route


module.exports = router;
