import Nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sendEmail = async ({ email, subject, template, data }) => {
  console.log("📧 [sendEmail] Starting email send process...");

  try {
    if (!template) {
      throw new Error("❌ Template is not defined");
    }

    console.log("🧩 Email details:");
    console.log(`   → To: ${email}`);
    console.log(`   → Subject: ${subject}`);
    console.log(`   → Template: ${template}`);

    // Create transporter
    console.log("⚙️  Creating mail transporter...");
    const transporter = Nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    console.log("✅ Transporter created successfully");

    // Resolve template path
    const templatePath = path.join(__dirname, "../Mails", template);
    console.log(`📂 Template path resolved: ${templatePath}`);

    // Render template with data
    console.log("🖋️ Rendering email template...");
    const html = await ejs.renderFile(templatePath, data);
    console.log("✅ Template rendered successfully");

    // Mail options
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject,
      html,
    };

    console.log("📦 Mail options prepared:");
    console.log(mailOptions);

    // Send mail
    console.log("🚀 Sending email...");
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log(`   → Message ID: ${info.messageId}`);
    console.log(`   → Preview URL: ${Nodemailer.getTestMessageUrl(info) || "N/A"}`);
    console.log(`   → Sent to: ${email}`);

    return info;
  } catch (error) {
    console.error("❌ [sendEmail] Error occurred while sending email:");
    console.error(error.message || error);
    throw error;
  }
};

export default sendEmail;
