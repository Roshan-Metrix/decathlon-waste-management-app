import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const normalizeSmtpUser = (smtpUser, senderEmail) => {
  if (!smtpUser) {
    return senderEmail;
  }

  if (smtpUser.includes("@")) {
    return smtpUser;
  }

  if (senderEmail?.includes("@")) {
    const [, domain] = senderEmail.split("@");
    return `${smtpUser}@${domain}`;
  }

  return smtpUser;
};

const smtpUser = normalizeSmtpUser(
  process.env.SMTP_USER,
  process.env.SENDER_EMAIL
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: smtpUser,
    pass: process.env.SMTP_PASS,
  },
});

export default transporter;
