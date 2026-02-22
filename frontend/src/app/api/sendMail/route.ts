// app/api/sendMail/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import axios from 'axios'; 

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let backendData;
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/send-password-reset-email`, // Update with your actual endpoint path
        { email },
        {
          headers: {
            'x-internal-secret': process.env.INTERNAL_SECRET_KEY!, 
          }
        }
      );
      backendData = response.data;
    } catch (axiosError: any) {
      // Forward the error from the backend (e.g., User not found)
      const errorMsg = axiosError.response?.data?.message || "Error generating OTP";
      return NextResponse.json({ error: errorMsg }, { status: axiosError.response?.status || 500 });
    }

    // Extract the OTP and username returned from your Render backend
    const { otp, username } = backendData.data;

    // 2. Configure Nodemailer with your Gmail App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 3. The Email Template
const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #09090b; margin: 0; padding: 0; color: #e4e4e7; }
        .container { max-width: 480px; margin: 40px auto; background-color: #18181b; border-radius: 12px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); }
        .header { background: linear-gradient(135deg, #27272a 0%, #18181b 100%); border-bottom: 1px solid #3f3f46; padding: 30px; text-align: center; }
        .header h1 { margin: 0; color: #fafafa; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
        .content { padding: 40px 30px; text-align: center; }
        .text { font-size: 15px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background-color: #09090b; border-radius: 8px; padding: 20px; margin: 0 auto 30px; letter-spacing: 12px; font-size: 36px; font-weight: 800; color: #fafafa; display: inline-block; border: 1px solid #3f3f46; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }
        .footer { padding: 20px; background-color: #09090b; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MIMI STUDIO</h1>
        </div>
        <div class="content">
          <p class="text">Hi <strong style="color: #e4e4e7;">${username}</strong>,<br>You requested to reset your password. Use the secure code below to proceed.</p>
          <div class="otp-box">${otp}</div>
          <p class="text" style="font-size: 13px;">This code expires in 10 minutes.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Mimi Studio. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    // 4. Send the Email
    await transporter.sendMail({
      from: `"Mimi Studio" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Mimi Password Reset Code',
      html: emailHtml,
    });

    return NextResponse.json({ message: "Reset code sent to your email" }, { status: 200 });

  } catch (error) {
    console.error("Email sending failed:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}