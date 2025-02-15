
const { collection, updateDoc, doc, query, where, getDocs } = require("firebase/firestore");
const { db } = require("../FirebaseConfig.js");

require('dotenv').config();



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

            const message = `Successfully updated your profile picture!`;
            console.log(message);
            return res.status(200).json({ success: true, message: message });
        } catch (error) {
            console.log("Checking POST Method ERROR...", res.statusCode, error.message);
            return res.status(500).json({ error: `Error: ${error.message}` });

        }
    }

    if (!['POST', 'GET', 'OPTIONS'].includes(req.method)) {
        console.log("Checking NO METHOD SELECTED...", res.statusCode);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}




