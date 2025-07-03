import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,          // ✅ from .env
      pass: process.env.EMAIL_PASSWORD, // ✅ from .env
    },
  });

  const mailOptions = {
    from: process.env.EMAIL, // sender address
    to,                      // recipient
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

export default sendEmail;
