const nodemailer = require('nodemailer');

// Create a transporter object with SMTP server details
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send an email using nodemailer
 * @param {String} to - Recipient email address
 * @param {String} subject - Email subject
 * @param {String} text - Plain text body
 * @param {String} html - HTML body (optional)
 */
const sendMail = async (to, subject, text, html = '') => {
  try {
    const info = await transporter.sendMail({
      from: 'MyMedics <' + process.env.EMAIL_USER + '>', // Replace with your sender details
      to,
      subject,
      text,
      html
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};

const sendPasswordResetMail = async (to, subject, text, html = '', user) => {
  try {
    const info = await transporter.sendMail({
      from: 'MyMedics <' + process.env.EMAIL_USER + '>', // Replace with your sender details
      to,
      subject,
      text,
      html,
      user
    });
    console.log('Password Reset Link Sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({validateBeforeSave: false});
  }

};

module.exports = { sendMail, sendPasswordResetMail };
