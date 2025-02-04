
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
            const { id, productData, imageUrl } = req.body;
            console.log("ImageURL:>>>>", imageUrl);

            if (!id || !productData.productName || productData.newPrice === undefined 
                || productData.oldPrice === undefined || !productData.category || imageUrl.length === 0) {
                return res.status(400).json({ success: false, error: "Missing required fields!" });
            }

            const docRef = doc(db, "judyhub-products", "products");
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.log("Document does not exist!");
                return res.status(400).json({ success: false, error: "Document does not exist!" });
            }

            const currentData = docSnap.data();
            if (!currentData.allProducts || !Array.isArray(currentData.allProducts)) {
                return res.status(400).json({ success: false, error: "Invalid product structure in database!" });
            }
            const updatedArray = currentData.allProducts.map((item) =>
                item.id === id
                    ? { 
                        ...item, 
                        name: productData.productName, 
                        newPrice: productData.newPrice, 
                        oldPrice: productData.oldPrice, 
                        category: productData.category, 
                        tags: productData.tags, 
                        image: imageURL 
                    }
                    : item
            );

            await updateDoc(docRef, { allProducts: updatedArray });
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



