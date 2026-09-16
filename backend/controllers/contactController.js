import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const emailUser = process.env.EMAIL_USER || 'riteshrts2k4757@gmail.com';
    const emailPass = process.env.EMAIL_PASS;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const mailOptions = {
      from: emailUser,
      to: 'riteshrana2k4@gmail.com',
      replyTo: email,
      subject: `Portfolio Contact: ${subject || 'New Message from ' + name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #22c55e;">New Contact Form Submission</h2>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 20px;">
            <p style="margin-bottom: 10px;"><strong>Name:</strong> ${name}</p>
            <p style="margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
            <p style="margin-bottom: 10px;"><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
        </div>
      `
    };

    if (emailPass) {
      await transporter.sendMail(mailOptions);
      console.log('✅ Real email sent successfully to riteshrana2k4@gmail.com');
    } else {
      console.log('⚠️ EMAIL_PASS not set. Simulating successful email send in development:');
      console.log(`From: ${emailUser} | To: riteshrana2k4@gmail.com | Subject: ${subject}`);
    }

    res.status(200).json({ success: true, message: 'Message sent successfully' });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
};
