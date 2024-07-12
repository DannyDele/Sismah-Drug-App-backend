const User = require('../../model/user/User');
const fs = require('fs');

// POST endpoint for file upload
const UserFile = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No file selected!' });
        }

        // Update user document with profile image path
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found!' });
        }

        // Delete existing profile image if present
        if (user.profileImage) {
            fs.unlinkSync(user.profileImage); // Remove the file from storage
        }

        user.profileImage = req.file.path; // Assuming 'profileImage' is a field in your User schema
        await user.save();

        res.status(200).json({ msg: 'Profile image uploaded successfully!', file: req.file });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error', err: error.message });
    }
};

module.exports = { UserFile };
