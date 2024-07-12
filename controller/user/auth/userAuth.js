const User = require('../../../model/user/User');
const HandleAsync = require('../../../utils/HandleAsync');
const AppError = require('../../../utils/AppError')
const sendMail = require('../../../services/NodeMailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');



// Generate unique user ID
// Function to generate a unique 6-digit numeric user ID
const generateUserId = async () => {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    let newId;

    do {
        newId = `USR-${Math.floor(min + Math.random() * (max - min + 1))}`;
        // Check if this ID already exists in your database or collection
        const existingUser = await User.findOne({ userId: newId });
        if (!existingUser) {
            break;
        }
    } while (true);

    return newId;
};


// // Generate unique pharmacy ID
// const generatePharmacyId = () => {
//     const pharmacyId = `PHARM-${Math.floor(100000 + Math.random() * 900000)}`;
//     return pharmacyId;
// };




// function to generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// JWT secret key
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const EXPIRES = process.env.LOGIN_EXPIRES




// Function to create/signup a user
const createUser = HandleAsync(async (req, res, next) => {
    const { firstName, lastName, username, email, phoneNumber, password, confirmPassword, userType } = req.body;


    //  check to see if user email exist
    const foundUser = await User.findOne({ email });
    if (foundUser) {
         throw new AppError('User with that email already exist', 409)

    }
      

    // Check if passwords match
    if (password !== confirmPassword) {
        // return res.status(400).json({ error: 'Password and confirm password do not match' });
        throw new AppError('Password and confirm password do not match', 403)
    }

    try {
        
        // Hash the password and assign it to the user
        const hashedPassword = await bcrypt.hash(password, 12);

       // Generate a unique userId
        const userId = await generateUserId();
        console.log('User Id:', userId);


         

        // Create a new user instance
        const user = new User({ firstName, lastName, userId, username, email, phoneNumber, password: hashedPassword, userType });
        
        // assign user role
        user.role = 'user';


        // Generate OTP
        const otp = generateOtp();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

        // Hash the OTP
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Save the hashed OTP and its expiration time in the user record
        user.otp = hashedOtp;
        user.otpExpires = otpExpires;

        // Save the user to the database
        await user.save();

        // // Send OTP email
        // await sendMail(
        //     email,
        //     'Your OTP Code',
        //     `Hello ${firstName},\n\nYour OTP code is ${otp}. Use this to verify your account.`,
        //     `<p>Hello ${firstName},</p><p>Your OTP code is <strong>${otp}</strong>. Use this to verify your account.</p>`
        // );

        // Respond with success message and user data
        res.status(201).json({ msg: 'User created successfully!', data: [user] });
    } catch (err) {
        next(err); // Pass the error to the next error handler
        console.error('Server error:', err);
    }
});


// function to veryfy users one time password (OTP)
const verifyOTP = HandleAsync(async (req, res, next) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Check if OTP is expired
        if (Date.now() > user.otpExpires) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        // check if user otp has already been verified
        if (user.otpVerification === true) {
            return res.status(400).json({ error: 'OTP already verified' });

        }

        // Compare the provided OTP with the hashed OTP
        const isMatch = await bcrypt.compare(otp, user.otp);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
      
        // OTP is valid, proceed with the verification process
        res.status(200).json({ msg: 'OTP verified successfully!' });

        // Optionally, you can clear the OTP fields after successful verification and set the user verification status to true
        user.otpVerification = true
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
    } catch (err) {
        next(err)
        console.error('Server error:', err);
    }
});




// Function to sign in a user
const signInUser = HandleAsync(async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: EXPIRES });

        // Respond with the token and user data
        res.status(200).json({ msg: 'Sign-in successful', access_token:token, data: [user] });
    } catch (err) {
        next(err)
        console.error('Server error:', err);
    }
});





module.exports = {
    createUser,
    verifyOTP,
    signInUser
}