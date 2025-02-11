
const { query, collection, where, getDocs } = require("firebase/firestore");
const { db } = require("../FirebaseConfig.js");
// const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");

require('dotenv').config();

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

// const judyhubAppSecretKey = process.env.JUDYHUB_APP_SECRET_KEY;


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

    // Fetching User Data Block
    if (req.method === "GET") {

        // const user = jwt.verify(token, judyhubAppSecretKey);
        // console.log("User: >>>>>", user);
        // if (!user || !user.email) {
        //     console.log("Access Denied: Invalid token");
        //     return res.status(403).json({ success: false, message: "Invalid token" });
        // }

        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                console.log("Access Denied: No token provided");
                return res.status(401).json({ success: false, message: "Access Denied: No token provided" });
            }
    
            const token = authHeader.split("Bearer ")[1];
    
            if (!token) {
                console.log("Access Denied: No token detected!");
                return res.status(401).json({ success: false, message: "Unauthorized!" });
            }
    
            const decodedToken = admin.auth().verifyIdToken(token, true);
            const user = await admin.auth().getUser(decodedToken.uid);

            console.log("User: >>>>>", user);
            const q = query(collection(db, "User_Data"), where("email", "==", user.email));
            const querySnapshot = await getDocs(q);
            const filteredData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Filtered Data: ", filteredData);
            const { name, email, number, image, address } = filteredData[0];
            const fetchedData = {
                name: name, 
                email: email, 
                number: number,
                address: address,
                image: image,
            };

            console.log("Fetched Data: >>>", fetchedData);
            return res.status(200).json({ data: fetchedData, message: "Data was fetched successfully" });
        } catch (error) {
            console.log("Checking ERROR FETCHING...", res.statusCode, error.message);
            return res.status(500).json({ success: false, message: `Couldn't fetch Data. Error: ${error.message}` });
        }
    }

    if (!['POST', 'GET', 'OPTIONS'].includes(req.method)) {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}


