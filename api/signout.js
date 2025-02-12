const { signOut } = require("firebase/auth");
const { auth } = require("../FirebaseConfig.js");
// const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");

require('dotenv').config();


// const judyhubAppSecretKey = process.env.JUDYHUB_APP_SECRET_KEY;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_SERVICE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: 'https://judy-hub-ecommerce.firebaseio.com',
    });
    console.log("Firebase Admin Initialized");
}



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

    // Signing Out Block
    if (req.method === "POST") {
        try {
            const { name } = req.body;
            await signOut(auth);
            const message = `Signed out, ${name.split(" ")[0]}`;
            console.log(message);
            return res.status(200).json({ success: true, message: message });
        } catch (error) {
            console.log("Checking POST Method ERROR...", res.statusCode, error);
            console.error("Error:", error.message);
            return res.status(500).json({ success: false, message: `Error: ${error.message}` });
        }
    }

    if (!['POST', 'GET', 'OPTIONS'].includes(req.method)) {
        console.log("Checking NO METHOD SELECTED...", res.statusCode);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}


