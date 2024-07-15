const User = require('../../../model/user/User');
const HandleAsync = require('../../../utils/HandleAsync');
const AppError = require('../../../utils/AppError')
const { sendMail } = require('../../../services/NodeMailer');
const { generateOtp } = require('../../../utils/ReuseableFuntions');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const { v4: uuidv4 } = require('uuid');



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





// JWT secret key
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const EXPIRES = process.env.LOGIN_EXPIRES




// Function to create/signup a user
const createUser = HandleAsync(async (req, res, next) => {

    try {

      const { firstName, lastName, username, email, phoneNumber, password, confirmPassword, userType } = req.body;


    //  check to see if user email exist
    const foundUser = await User.findOne({ email });
    if (foundUser) {
        return next( new AppError('User with that email already exist', 409));
        // return res.status(409).json({msg:'User with that email already exist'});

    }
      

    // Check if passwords match
    if (password !== confirmPassword) {
        // return res.status(400).json({ error: 'Password and confirm password do not match' });
        return next(new AppError('Password and confirm password do not match', 403));
    }
 


        
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
   await sendMail(
  email,
  'Your OTP Code',
  `Hello ${firstName},\n\nYour OTP code is ${otp}. Use this to verify your account.`,
  `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <h1 style="text-align: center; color: #4CAF50;">MyMedics</h1>
      <p>Hello ${firstName},</p>
      <p>Your OTP code is:</p>
      <div style="background-color: #007BFF; color: white; padding: 10px 15px; border-radius: 5px; text-align: center; font-size: 18px; margin: 10px 0;">
        <strong>${otp}</strong>
      </div>
      <p>Use this to verify your account.</p>
      <p>If you did not request this code, please ignore this email or contact support if you have questions.</p>
      <p>Thank you,<br>MyMedics Team</p>
    </div>
  `
);


        // Respond with success message and user data
        res.status(201).json({ msg: 'User created successfully!', data: [user] });
    } catch (err) {
        next(err); // Pass the error to the next error handler
        console.error('Server error:', err);
    }
});


// function to veryfy users one time password (OTP)
const verifyOTP = HandleAsync(async (req, res, next) => {
    try {
       const { email, otp } = req.body;



        const user = await User.findOne({ email });

        if (!user) {
            // return res.status(400).json({ error: 'User not found' });
            return next(new AppError('User not found!', 404))

        }

        // Check if OTP is expired
        if (Date.now() > user.otpExpires) {
            // return res.status(400).json({ error: 'OTP has expired' });
                return next(new AppError('OTP has expired!', 400))

        }

        // check if user otp has already been verified
        if (user.otpVerification === true) {
            // return res.status(400).json({ error: 'OTP already verified' });
                  return next(new AppError('OTP already verified!', 400))


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
const signInUser = HandleAsync(async (req, res, next) => {

    try {

            const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            // return res.status(400).json({ error: 'Invalid email or password' });
            return next(new AppError('Invalid email or password!', 400));

        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // return res.status(400).json({ error: 'Invalid email or password' });
            return next(new AppError('Invalid email or password!', 400));

        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.userId, role: user.role, email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: EXPIRES });

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