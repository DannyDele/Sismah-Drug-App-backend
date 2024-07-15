const express = require('express');
const router = express.Router();
const { getAllUsers, createCategory, updateACategory, deleteACategory } = require('../../../controller/Super-Admin/functions/supAdminFunc');


// Super admin function routes for user management

router.route('/super-admin/users')
    .get(getAllUsers);





// Super admin function routes for category management
router.route('/super-admin/category')
    .post(createCategory);

router.route('/super-admin/category/:categoryId')
    .delete(deleteACategory)
    .patch(updateACategory);


module.exports = router;
