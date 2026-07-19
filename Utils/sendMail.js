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


  try {
    if (!template) {
      throw new Error(" Template is not defined completely");
    }


    const transporter = Nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });



    // Resolve template path
    const templatePath = path.join(__dirname, "../Mails", template);
    

    const html = await ejs.renderFile(templatePath, data);


    // Mail options
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject,
      html,
    };

 
    const info = await transporter.sendMail(mailOptions);

  

    return info;
  } catch (error) {
   
    throw error;
  }
};

export default sendEmail;
