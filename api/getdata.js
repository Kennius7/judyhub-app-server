const { collection, getDocs } = require("firebase/firestore");
const { db } = require("../FirebaseConfig.js");
require('dotenv').config();



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

    if (req.method === "GET") {
        try {
            const querySnapshot = await getDocs(collection(db, "judyhub-products"));
            const filteredData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Filtered Data: ", filteredData);
            const allProducts = filteredData[0].allProducts;
            console.log("Arrayed Data:>>>>", allProducts);
            return res.status(200).json({ data: allProducts, message: "Data was fetched successfully" });
        } catch (error) {
            console.log("Checking ERROR FETCHING...", res.statusCode, error.message);
            return res.json({ error: `Couldn't fetch Data. Error: ${error.message}` });
        }
    }

    if (!['POST', 'GET', 'OPTIONS'].includes(req.method)) {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}


