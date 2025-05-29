import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// EJS email templete
const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "auth-service",
    "src",
    "utils",
    "email-template",
    `${templateName}.ejs`
  );

  return ejs.renderFile(templatePath, data);
};

// Send email
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
): Promise<boolean> => {
  try {
    const html = await renderEmailTemplate(templateName, data);
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
