
const { query, collection, where, getDocs } = require("firebase/firestore");
const { db } = require("../FirebaseConfig.js");
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

    // Fetching User Data Block
    if (req.method === "GET") {
        // const token = req.headers.authorization.split('Bearer ')[1];
        // if (!token) { return res.status(401).send("Access Denied!") };

        const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                console.log("Access Denied: No token provided");
                return res.status(401).json({ success: false, message: "Access Denied: No token provided" });
            }

            const token = authHeader.split("Bearer ")[1];
            const user = jwt.verify(token, judyhubAppSecretKey);
            if (!user || !user.email) {
                console.log("Access Denied: Invalid token");
                return res.status(403).json({ success: false, message: "Invalid token" });
            }

        // const user = jwt.verify(token, judyhubAppSecretKey, (err, user) => {
        //     if (err) return res.status(403).send("Invalid Token!");
        //     req.user = user;
        //     const userData = req.user;
        //     return userData;
        // })

        try {
            // const userEmail = user.email;
            console.log("User: >>>>>", user);
            const q = query(collection(db, "User_Data"), where("email", "==", user.email));
            const querySnapshot = await getDocs(q);
            const filteredData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Filtered Data: ", filteredData);
            const { name, email, number, id } = filteredData[0];
            const fetchedData = {
                name: name, 
                email: email, 
                number: number,
                id: id,
            };

            console.log("Fetched Data: >>>", fetchedData);
            return res.status(200).json({ data: fetchedData, message: "Data was fetched successfully" });
        } catch (error) {
            console.log("Checking ERROR FETCHING...", res.statusCode, error.message);
            return res.json({ error: `Couldn't fetch Data. Error: ${error.message}` });
        }
    }

    if (!['POST', 'GET', 'OPTIONS'].includes(req.method)) {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}


