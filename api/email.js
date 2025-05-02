const nodemailer = require('nodemailer');
require('dotenv').config();


const userEmail = process.env.NODEMAILER_USER_EMAIL;
const userEmail1 = process.env.NODEMAILER_USER_EMAIL1;
const userPassword = process.env.NODEMAILER_USER_PASSWORD;


export default async function handler(req, res) {
    console.log("Checking...");
    
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        console.log("Checking OPTIONS Method...", res.statusCode);
        return;
    }

    if (req.method === "POST" && req.body.apiType === "MAIN") {
        const formData = req.body;
        const { name, email, number, subject, message } = formData;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: userEmail,
                pass: userPassword,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    
        const htmlEmail = `
            <html>
                <body>
                    <p>${name.split(" ")[0]} just sent an email.</p>
                    <p>Phone number: ${number}</p>
                    <p>Email address: ${email}</p>
                    <p>Email Subject Header: ${subject}</p>
                    <p>Email: ${message}</p>
                </body>
            </html>
        `;
    
        const mailOptions = {
            from: userEmail,
            to: userEmail,
            subject: subject,
            html: htmlEmail,
        }

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Got here...");
            console.log("Email sent: >>>>", info.response);
            return res.status(200).json({ success: true, message: 'Email sent successfully' });
        } catch (error) {
            console.error("Error: ", error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }



















    // Email Endpoint for JUDYHUB Landing page
    if (req.method === "POST" && req.body.apiType === "LANDING") {
        const { name, email, fullMessage, totalCartPrice } = req.body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: userEmail,
                pass: userPassword,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    
        const htmlEmail = `
            <html>
                <body>
                    <p>${name.split(" ")[0]} just sent an order.</p>
                    <p>Email address: ${email}</p>
                    <p>Product Purchase Details:</p>
                    <p>${fullMessage}</p>
                    <p>Total Amount: N${totalCartPrice}</p>
                </body>
            </html>
        `;

        const mailOptions = {
            from: userEmail,
            to: [userEmail, userEmail1],
            subject: `Product Purchase Details for ${name.split(" ")[0]}`,
            html: htmlEmail,
        }

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Got here...");
            console.log("Email sent: >>>>", info.response);
            return res.status(200).json({ success: true, message: 'Email sent successfully' });
        } catch (error) {
            console.error("Error: ", error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    if (!['POST', 'GET', 'OPTIONS'].includes(req.method)) {
        console.log("Method not allowed");
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}

