// services/mail.service.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.sendAdminCredentialsMail = async ({ to, empcode, password, deptName }) => {
  const subject = `Admin Account Created for ${deptName}`;
  const html = `
    <h3>Your Admin Account has been created</h3>
    <p><b>Department:</b> ${deptName}</p>
    <p><b>Empcode:</b> ${empcode}</p>
    <p><b>Password:</b> ${password}</p>
    <br/>
    <p>Please login and update your password immediately.</p>
  `;

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    cc: "suraj.patil@netcastservice.com", 
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
};
