import nodemailer from "nodemailer";
import config from "./nodemailerConfig.js";

const sendEmail = async ({ to, subject, html }) => {
  const testAccount = await nodemailer.createTestAccount();

  const trasnporter = nodemailer.createTransport(config);

  return trasnporter.sendMail({
    from: "Keep Coding <weston.schaden95@ethereal.email>",
    to, // list of receivers
    subject,
    html,
  });
};

export default sendEmail;
