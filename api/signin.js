const { signInWithEmailAndPassword } = require("firebase/auth");
const { auth } = require("../FirebaseConfig.js");
const jwt = require("jsonwebtoken");

require('dotenv').config();


const judyhubAppSecretKey = process.env.JUDYHUB_APP_SECRET_KEY;

// const admin = require("firebase-admin");

// if (!admin.apps.length) {
//     admin.initializeApp({
//         credential: admin.credential.cert({
//             projectId: process.env.FIREBASE_PROJECT_ID,
//             clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//             privateKey: process.env.FIREBASE_SERVICE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//         }),
//         databaseURL: 'https://shosan-acodemia-app.firebaseio.com',
//     });
// }


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

    // Signing In Block
    if (req.method === "POST") {
        try {
            const { email, password } = req.body;
            const newUser = await signInWithEmailAndPassword(auth, email, password);
            
            if (!newUser || !newUser.user) {
                return res.status(401).json({ success: false, error: "Invalid credentials" });
            }

            // const userInfo = { email: email };
            const userInfo = { email: newUser.user.email, uid: newUser.user.uid };
            const token = jwt.sign(userInfo, judyhubAppSecretKey, { expiresIn: "1h" });
            console.log("Token: >>>", token);
            // const message = `Welcome, ${newUser?.user?.displayName.split(" ")[0]}`;
            const message = `Welcome, ${newUser.user.displayName ? newUser.user.displayName.split(" ")[0] : "User"}`;
            console.log(message);
            return res.status(200).json({ success: true, message: message, token: token });
        } catch (error) {
            console.log("Checking POST Method ERROR...", res.statusCode, error);
            console.error("Authentication Error:", error.message);
            return res.status(401).json({ success: false, error: `Error: ${error.message}` });
            // return res.status(401).json({ success: false, error: "Invalid email or password" });
        }
    }

    if (!['POST', 'GET', 'OPTIONS'].includes(req.method)) {
        console.log("Checking NO METHOD SELECTED...", res.statusCode);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}


