import Nodemailer from "nodemailer";
import dotenv from 'dotenv';
import ejs from "ejs";
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sendEmail = async ({ email, subject, template, data }) => {
  

    if (!template) {
        throw new Error("Template is not defined");
    }

    const transporter = Nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        }
    });

    // get email template
    const templatePath = path.join(__dirname, "../Mails", template);

    // render template
    const html = await ejs.renderFile(templatePath, data);


    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject: subject,
        html
    };


    await transporter.sendMail(mailOptions);
};

export default sendEmail;
