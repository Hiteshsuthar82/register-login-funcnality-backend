const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  // CREATE A TRANSPORTER
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // DEFINING EMAIL OPTION
  const emailOPtions = {
    from: "Hitesh support<support@hitesh.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  // sending email
  try {
    await transporter.sendMail(emailOPtions);
    console.log('Email sent successfully');
  } catch (err) {
    console.error('Error in sending email', err)
    throw err;
  }
};

module.exports = sendEmail;
