import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// connection verification (optional)
transporter.verify((error) => {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server Ready');
    }
});

export const sendOtpEmail = async (email, otp, purpose = 'verification') => {
    const subject = purpose === 'verification'
        ? 'Email Verification OTP'
        : 'Password Reset OTP';

    const html = `
      <p>Your ${purpose} OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await transporter.sendMail({
        from: '"Marketplace" <support@yourdomain.com>',
        to: email,
        subject,
        html
    });
};
