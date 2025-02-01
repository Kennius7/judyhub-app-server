
const { doc, updateDoc, getDoc } = require("firebase/firestore");
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
    if (req.method === "POST") {
        try {
            const { id, productName, newPrice, oldPrice, category, tags, imageUrl } = req.body;

            const docRef = doc(db, "judyhub-products", "products");
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.log("Document does not exist!");
                return res.status(400).json({ success: false, error: "Document does not exist!" });
            }

            const updatedData = {
                id: id,
                name: productName,
                category: category,
                tags: tags,
                image: imageUrl,
                newPrice: newPrice,
                oldPrice: oldPrice,
            };

            const currentData = docSnap.data();
            const updatedArray = currentData.arrayField.map(item => {
                item.id === id ? { ...item, ...updatedData } : item 
            });
            await updateDoc(docRef, { arrayField: updatedArray });
            const message = `Successfully posted product data`;
            console.log(message);
            return res.status(200).json({ success: true, message: message });
        } catch (error) {
            console.log("Checking POST Method ERROR...", res.statusCode);
            console.log(error);
            return res.status(500).json({ error: `Error: ${error.message}` });
        }
    }

    if (!['POST', 'GET', 'OPTIONS'].includes(req.method)) {
        console.log("Checking NO METHOD SELECTED...", res.statusCode);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}



