const DispatchCompany = require('../../../model/dispatch-company/DispatchCompany');
const Pharmacy = require('../../../model/pharmacy/Pharmacy');
const HandleAsync = require('../../../utils/HandleAsync');
const AppError = require('../../../utils/AppError')
const { sendMail } = require('../../../services/NodeMailer');
const { generateOtp } = require('../../../utils/ReuseableFuntions');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');






// Function to generate a unique 6-digit numeric DispatchCompany ID
const generateDipatchCompanyId = async () => {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    let newId;

    do {
        newId = `DISP-${Math.floor(min + Math.random() * (max - min + 1))}`;
        // Check if this ID already exists in your database or collection
        const existingdDispatchCompany = await DispatchCompany.findOne({ dispatchCompanyId: newId });
        if (!existingdDispatchCompany) {
            break;
        }
    } while (true);

    return newId;
};







// JWT secret key
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const EXPIRES = process.env.LOGIN_EXPIRES






// Function to create/signup a DispatchCompany
const createDispatchCompany = HandleAsync(async (req, res, next) => {
 

    try {


   const { name, state, city, email, phoneNumber, password, confirmPassword, userType } = req.body;


    //  check to see if DispatchCompany email exist
    const foundDispatchCompany = await DispatchCompany.findOne({ email });
    if (foundDispatchCompany) {
        // return res.status(409).json({ error: 'Pharmacy with that email already exist!' });
        return next(new AppError('DispatchCompany with that email already exist!', 409));



    }
      

    // Check if passwords match
    if (password !== confirmPassword) {
        // return res.status(403).json({ error: 'Password and confirm password do not match!' });
        return next(new AppError('Password and confirm password do not match!', 403));


    }


        
        // Hash the password and assign it to the pharmacy
        const hashedPassword = await bcrypt.hash(password, 12);
   
      
    // Generate a unique dispatchCompanyId
        const dispatchCompanyId = await generatePharmacyId();
        console.log('Dispatch-Company Id:', dispatchCompanyId);



        // Create a new DispatchCompany instance
        const dispatchCompany = new DispatchCompany({ name, state, dispatchCompanyId, zone:'Zone A', city, email, phoneNumber, password: hashedPassword, userType });
        
        // assign pharmacy role
        dispatchCompany.role = 'admin';


        // Generate OTP
        const otp = generateOtp();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

        // Hash the OTP
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Save the hashed OTP and its expiration time in the user record
        dispatchCompany.otp = hashedOtp;
        dispatchCompany.otpExpires = otpExpires;

        // Save the dispatchCompany to the database
        await dispatchCompany.save();

        // Send OTP email
  await sendMail(
  email,
  'Your OTP Code',
  `Hello ${name},\n\nYour OTP code is ${otp}. Use this to verify your account.`,
  `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <h1 style="text-align: center; color: #4CAF50;">MyMedics</h1>
      <p>Hello ${name},</p>
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



        // Respond with success message and pharmacy data
        res.status(201).json({ msg: 'Dispatch Company created successfully!', data: [dispatchCompany] });
    } catch (err) {
        next(err); // Pass the error to the next error handler
        console.error('Server error:', err);
    }
});


// function to veryfy pharmacies one time password (OTP)
const verifyOTP = HandleAsync(async (req, res, next) => {
    const { email, otp } = req.body;
    try {
        const dispatchCompany = await DispatchCompany.findOne({ email });

        if (!dispatchCompany) {
            // return res.status(400).json({ error: 'DispatchCompany not found' });
            return next(new AppError('Dispatch Company not found!', 400));

        }

        // Check if OTP is expired
        if (Date.now() > dispatchCompany.otpExpires) {
            // return res.status(400).json({ error: 'OTP has expired' });
            return next(new AppError('OTP has expired!', 400));

        }

        // Compare the provided OTP with the hashed OTP
        const isMatch = await bcrypt.compare(otp, dispatchCompany.otp);

        if (!isMatch) {
            // return res.status(400).json({ error: 'Invalid OTP' });
            return next(new AppError('Invalid OTP!', 400));

        }
      
        // OTP is valid, proceed with the verification process
        res.status(200).json({ msg: 'OTP verified successfully!' });

        // Optionally, you can clear the OTP fields after successful verification and set the dispatchCompany verification status to true
        dispatchCompany.otpVerification = true
        dispatchCompany.otp = undefined;
        dispatchCompany.otpExpires = undefined;
        await dispatchCompany.save();
    } catch (err) {
        next(err)
        console.error('Server error:', err);
    }
});




// Function to sign in a dispatchCompany
const signInDispatchCompany = HandleAsync(async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Find the dispatchCompany by email
        const dispatchCompany = await DispatchCompany.findOne({ email });
        if (!dispatchCompany) {
            // return res.status(400).json({ error: 'Invalid email or password' });
             return next(new AppError('Invalid email or password!', 400));

        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, dispatchCompany.password);
        if (!isMatch) {
            // return res.status(400).json({ error: 'Invalid email or password' });
            return next(new AppError('Invalid email or password!', 400));

        }

        // Generate a JWT token
        const token = jwt.sign({ id: dispatchCompany.dispatchCompanyId, role: dispatchCompany.role, email: dispatchCompany.email }, ACCESS_TOKEN_SECRET, { expiresIn: EXPIRES });

        // Respond with the token and dispatchCompany data
        res.status(200).json({ msg: 'Sign-in successful', access_token:token, data: [dispatchCompany] });
    } catch (err) {
        next(err)
        console.error('Server error:', err);
    }
});





module.exports = {
    createDispatchCompany,
    verifyOTP,
    signInDispatchCompany
}