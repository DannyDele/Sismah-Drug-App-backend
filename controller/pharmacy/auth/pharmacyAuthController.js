const Pharmacy = require('../../../model/pharmacy/Pharmacy');
const HandleAsync = require('../../../utils/HandleAsync');
const AppError = require('../../../utils/AppError')
const sendMail = require('../../../services/NodeMailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




// function to generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// JWT secret key
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const EXPIRES = process.env.LOGIN_EXPIRES






// Function to create/signup a pharmacy
const createPharmacy = HandleAsync(async (req, res) => {
    const { name, state, zone, city, email, phoneNumber, password, confirmPassword, userType } = req.body;


    //  check to see if pharmacy email exist
    const foundPharmacy = await Pharmacy.findOne({ email });
    if (foundPharmacy) {
         throw new AppError('Pharmacy with that email already exist', 409)

    }
      

    // Check if passwords match
    if (password !== confirmPassword) {
        // return res.status(400).json({ error: 'Password and confirm password do not match' });
        throw new AppError('Password and confirm password do not match', 403)
    }

    try {
        
        // Hash the password and assign it to the pharmacy
        const hashedPassword = await bcrypt.hash(password, 12);
   
      

        // Create a new pharmacy instance
        const pharmacy = new Pharmacy({ name, state, zone, city, email, phoneNumber, password: hashedPassword, userType });
        
        // assign pharmacy role
        pharmacy.role = 'user';


        // Generate OTP
        const otp = generateOtp();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

        // Hash the OTP
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Save the hashed OTP and its expiration time in the user record
        pharmacy.otp = hashedOtp;
        pharmacy.otpExpires = otpExpires;

        // Save the pharmacy to the database
        await pharmacy.save();

        // Send OTP email
        await sendMail(
            email,
            'Your OTP Code',
            `Hello ${name},\n\nYour OTP code is ${otp}. Use this to verify your account.`,
            `<p>Hello ${name},</p><p>Your OTP code is <strong>${otp}</strong>. Use this to verify your account.</p>`
        );

        // Respond with success message and pharmacy data
        res.status(201).json({ msg: 'Pharmacy created successfully!', data: [pharmacy] });
    } catch (err) {
        res.status(500).json({ error: 'Server error', err });
        console.error('Server error:', err);
    }
});


// function to veryfy pharmacies one time password (OTP)
const verifyOTP = HandleAsync(async (req, res) => {
    const { email, otp } = req.body;
    try {
        const pharmacy = await Pharmacy.findOne({ email });

        if (!pharmacy) {
            return res.status(400).json({ error: 'Pharmacy not found' });
        }

        // Check if OTP is expired
        if (Date.now() > pharmacy.otpExpires) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        // Compare the provided OTP with the hashed OTP
        const isMatch = await bcrypt.compare(otp, pharmacy.otp);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
      
        // OTP is valid, proceed with the verification process
        res.status(200).json({ msg: 'OTP verified successfully!' });

        // Optionally, you can clear the OTP fields after successful verification and set the pharmacy verification status to true
        pharmacy.otpVerification = true
        pharmacy.otp = undefined;
        pharmacy.otpExpires = undefined;
        await pharmacy.save();
    } catch (err) {
        res.status(500).json({ error: 'Server error', err });
        console.error('Server error:', err);
    }
});




// Function to sign in a pharmacy
const signInPharmacy = HandleAsync(async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the pharmacy by email
        const pharmacy = await Pharmacy.findOne({ email });
        if (!pharmacy) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, pharmacy.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: pharmacy._id, role: pharmacy.role, email: pharmacy.email }, ACCESS_TOKEN_SECRET, { expiresIn: EXPIRES });

        // Respond with the token and pharmacy data
        res.status(200).json({ msg: 'Sign-in successful', access_token:token, data: [pharmacy] });
    } catch (err) {
        res.status(500).json({ error: 'Server error', err });
        console.error('Server error:', err);
    }
});





module.exports = {
    createPharmacy,
    verifyOTP,
    signInPharmacy
}