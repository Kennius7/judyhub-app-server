
const { getAuth, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require("firebase/auth");
const { collection, addDoc } = require("firebase/firestore");
const { db, auth } = require("../FirebaseConfig.js");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");

require('dotenv').config();


const judyhubAppSecretKey = process.env.JUDYHUB_APP_SECRET_KEY;

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

    // Signing Up Block
    if (req.method === "POST" && req?.body?.apiType === "SIGNUP") {
        try {
            const { name, email, number, password, address, image, cartData } = req.body;

            if (!name || !email || !number || !password) {
                return res.status(400).json({ success: false, error: "All fields are required" });
            }

            const authInstance = getAuth();
            const newUser = await createUserWithEmailAndPassword(authInstance, email, password);
            await updateProfile(newUser.user, { displayName: name });
            await addDoc(collection(db, "User_Data"), { name, email, number, address, image, cartData });
            console.log("User Created:", newUser.user.email);
            console.log(newUser);
            const displayName = newUser?.user?.displayName.split(" ")[0] || "User";
            const message = `Successfully signed up, ${displayName}`;
            console.log(message);
            return res.status(200).json({ success: true, message: message });
        } catch (error) {
            console.log("Checking POST Method ERROR...", res.statusCode, error.message);

            let errorMessage = "Something went wrong";
            if (error.code === "auth/email-already-in-use") {
                errorMessage = "Email is already in use. Please use a different one.";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password is too weak. Please choose a stronger password.";
            }

            return res.status(400).json({ success: false, error: errorMessage });
        }
    }

    // Signing In Block
    if (req.method === "POST" && req?.body?.apiType === "SIGNIN") {
        try {
            const { email, password } = req.body;
            const newUser = await signInWithEmailAndPassword(auth, email, password);
            
            if (!newUser || !newUser.user) {
                return res.status(401).json({ success: false, message: "Invalid credentials" });
            }

            const userInfo = { email: newUser.user.email, uid: newUser.user.uid };
            const token = jwt.sign(userInfo, judyhubAppSecretKey, { expiresIn: "1h" });
            console.log("User: >>>>>", newUser.user.displayName);
            console.log("Token: >>>", token);
            const message = `Welcome, ${newUser.user.displayName ? newUser.user.displayName.split(" ")[0] : "User"}`;
            console.log(message);
            return res.status(200).json({ success: true, message: message, token: token });
        } catch (error) {
            console.log("Checking POST Method ERROR...", res.statusCode, error);
            console.error("Authentication Error:", error.message);
            return res.status(401).json({ success: false, error: `Error: ${error.message}` });
        }
    }

    // Signing Out Block
    if (req.method === "POST" && req?.body?.apiType === "SIGNOUT") {
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



