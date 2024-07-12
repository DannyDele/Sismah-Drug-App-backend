const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directory path for uploads
const uploadDirectory = './uploads/product-images/';

// Create the directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        cb(null, `product_${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Init multer upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // File size limit (in bytes)
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).any(); // Accept any files

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images only! (JPEG, JPG, PNG)');
    }
}

module.exports = {
    upload
};
