const express = require('express');
const router = express.Router();
const { createDispatchCompany } = require('../../../controller/Dispatch-Company/auth/DispatchCompany');
const { upload } = require('../../../services/fileUpload/productImage(s)');

// Pharmacy authentication routes
router.route('/dispatch-company')
    .post(createDispatchCompany);


module.exports = router;
