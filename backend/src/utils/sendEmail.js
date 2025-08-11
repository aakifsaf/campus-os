import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import path from 'path';
import ejs from 'ejs';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
});

// Promisify the ejs.renderFile function
const renderFile = promisify(ejs.renderFile);

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message
 * @param {string} options.template - EJS template name (without .ejs)
 * @param {Object} options.templateData - Data to pass to the EJS template
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async ({
  email,
  subject,
  message,
  template = null,
  templateData = {},
}) => {
  try {
    let html = message;

    // If a template is provided, render it with the provided data
    if (template) {
      const templatePath = path.join(
        __dirname,
        '..',
        'views',
        'emails',
        `${template}.ejs`
      );
      html = await renderFile(templatePath, {
        ...templateData,
        subject,
        message,
      });
    }

    // Setup email data
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject,
      text: message,
      html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

export default sendEmail;
