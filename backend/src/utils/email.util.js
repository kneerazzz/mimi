import nodemailer from 'nodemailer'
import { EMAIL_PASS, EMAIL_USER } from '../config/env.js';
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
})

export const sendEmail  = async({to, subject, text, html}) => {
    try {
        const info = await transporter.sendMail({
            from: `"MIMI" <${EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        })
        
    } catch (error) {
        console.log("Error sending email:", error);
        throw error  
    }
}