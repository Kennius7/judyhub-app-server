
const { collection, updateDoc, doc, query, where, getDocs } = require("firebase/firestore");
const { db } = require("../FirebaseConfig.js");
const jwt = require("jsonwebtoken");
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

const judyhubAppSecretKey = process.env.JUDYHUB_APP_SECRET_KEY;



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

    // Update Profile Block
    if (req.method === "POST" && !req.body.apiType) {
        try {
            const { profileFormData } = req.body;
            
            if (profileFormData?.email?.length === 0) {
                console.log("Data not found!");
                return res.status(400).json({ success: false, error: "Data not found!" });
            }

            const { email, name, address, number } = profileFormData;
            let id = "";
            let userData;
            console.log("Profile Data:>>>", profileFormData);

            const q = query(collection(db, "User_Data"), where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                id = doc.id;
                userData = doc.data();
            }
            console.log("id:>>>", id, "User Data:>>>", userData);

            const docRef = doc(db, "User_Data", id);
            await updateDoc(docRef, { name: name, email: email, number: number, address: address });

            const message = `Successfully updated your profile data!`;
            console.log(message);
            return res.status(200).json({ success: true, message: message });
        } catch (error) {
            console.log("Checking POST Method ERROR...", res.statusCode, error.message);
            return res.status(500).json({ error: `Error: ${error.message}` });

        }
    }

    // Update Profile Picture Block
    if (req.method === "POST" && req.body.apiType === "UPDATEPICS") {
        try {
            const { updatedData } = req.body;
            
            if (updatedData?.email?.length === 0) {
                return res.status(400).json({ success: false, error: "Data not found!" });
            }

            const { email, image } = updatedData;
            let id = "";
            let userData;
            console.log("Email:>>>>", email);

            const q = query(collection(db, "User_Data"), where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                id = doc.id;
                userData = doc.data();
            }
            console.log("id:>>>", id, "User Data:>>>", userData);

            const docRef = doc(db, "User_Data", id);
            await updateDoc(docRef, { image: image });

            const message = `Successfully updated your profile picture!`;
            console.log(message);
            return res.status(200).json({ success: true, message: message });
        } catch (error) {
            console.log("Checking POST Method ERROR...", res.statusCode, error.message);
            return res.status(500).json({ error: `Error: ${error.message}` });
        }
    }

    // Update Cart Block
    if (req.method === "POST" && req.body.apiType === "UPDATECART") {
        try {
            if (!req.body) {
                console.log("Request body is missing or invalid.");
                return res.status(400).json({ success: false, message: "Request body is missing or invalid." });
            }

            const { email, cartData } = req.body;
            let id = "";
            let userData;
            console.log("Email:>>>>", email);

            const q = query(collection(db, "User_Data"), where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                id = doc.id;
                userData = doc.data();
            }
            console.log("id:>>>", id, "User Data:>>>", userData);

            const docRef = doc(db, "User_Data", id);
            await updateDoc(docRef, { cartData: cartData });

            const message = `Successfully updated your cart!`;
            console.log(message);
            return res.status(200).json({ success: true, message: message });
        } catch (error) {
            console.log("Checking POST Method ERROR...", res.statusCode, error.message);
            return res.status(500).json({ error: `Error: ${error.message}` });

        }
    }

    // Fetch User Data Block
    if (req.method === "GET" && req.body.apiType === "FETCHUSERDATA") {
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

            const user = jwt.verify(token, judyhubAppSecretKey, (err, user) => {
                if (err) return res.status(403).send("Invalid Token!");
                req.user = user;
                const userData = req.user;
                return userData;
            })

            console.log("User: >>>>>", user);
            const q = query(collection(db, "User_Data"), where("email", "==", user.email));
            const querySnapshot = await getDocs(q);
            const filteredData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Filtered Data: ", filteredData);
            const { name, email, number, image, address, cartData } = filteredData[0];
            const fetchedData = {
                name: name, 
                email: email, 
                number: number,
                address: address,
                image: image,
                cartData: cartData,
            };

            console.log("Fetched Data: >>>", fetchedData);
            return res.status(200).json({ data: fetchedData, message: "Data was fetched successfully" });
        } catch (error) {
            console.log("Checking ERROR FETCHING...", res.statusCode, error.message);
            return res.status(500).json({ success: false, message: `Couldn't fetch Data. Error: ${error.message}` });
        }
    }

    if (!['POST', 'GET', 'OPTIONS'].includes(req.method)) {
        console.log("Checking NO METHOD SELECTED...", res.statusCode);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}




