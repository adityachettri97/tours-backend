const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"Tours & Travel Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Password Reset OTP",
    html: `
      <p>You requested a password reset.</p>
      <p>Your OTP is: <strong style="font-size: 20px;">${otp}</strong></p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });
};

module.exports = { sendOtpEmail };
