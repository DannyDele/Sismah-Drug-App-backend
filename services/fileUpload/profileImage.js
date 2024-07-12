const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directory path for uploads
const uploadDirectory = './uploads/profile-images/';

// Create the directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory); // Destination folder for profile images
    },
    filename: function (req, file, cb) {
        cb(null, 'user_' + req.params.userId + path.extname(file.originalname)); // Set filename
    }
});

// Init multer upload
const userProfileImageUpload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // File size limit (in bytes)
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb); // Function to check file type
    }
}).single('profileImage'); // Field name for the file upload (e.g., <input name="profileImage">)

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

module.exports = { userProfileImageUpload };
