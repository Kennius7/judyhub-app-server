
const { doc, updateDoc, collection, getDocs, getDoc } = require("firebase/firestore");
const { db } = require("../FirebaseConfig.js");

require('dotenv').config();



export default async function handler(req, res) {
    console.log("Checking...");
    console.log("Request API Type:>>>", req.body);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        console.log("Checking OPTIONS Method...", res.statusCode);
        return;
    }

    // Post Products (Initial Data) Block
    if (req.method === "POST" && req?.body?.apiType === "POSTPRODUCTDATA") {
        try {
            const { allProducts } = req.body;
            const docRef = doc(db, "judyhub-products", "products");
            await updateDoc(docRef, { allProducts });
            const message = `Successfully posted data`;
            console.log(message);
            return res.status(200).json({ success: true, message: message });
        } catch (error) {
            console.log("Checking POST Method ERROR...", res.statusCode);
            console.log(error);
            return res.status(500).json({ error: `Error: ${error.message}` });
        }
    }

    //Fetch Products Data Block
    if (req.method === "POST" && req.body.apiType === "GETPRODUCTS") {
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

    // Edit Product Block
    if (req.method === "POST" && req.body.apiType === "EDITPRODUCTS") {
        try {
            const { id, updatedData } = req.body;
            console.log("ImageURL:>>>>", updatedData.image);

            if (!id || !updatedData.productName || updatedData.newPrice === undefined 
                || updatedData.oldPrice === undefined || !updatedData.category || updatedData.image.length === 0) {
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
                        name: updatedData.productName, 
                        newPrice: updatedData.newPrice, 
                        oldPrice: updatedData.oldPrice, 
                        category: updatedData.category, 
                        tags: updatedData.tags, 
                        image: updatedData.image, 
                        description: updatedData.description, 
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

    // Add New Product Block
    if (req.method === "POST" && req.body.apiType === "ADDPRODUCT") {
        try {
            const { updatedData } = req.body;
            console.log("ImageURL:>>>>", updatedData.image);

            if (!updatedData.productName || updatedData.newPrice === undefined 
                || updatedData.oldPrice === undefined || !updatedData.category 
                || updatedData.image.length === 0 || !updatedData.tags || !updatedData.id) {
                    console.log("Missing required fields!");
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
                console.log("Invalid product structure in database!");
                return res.status(400).json({ success: false, error: "Invalid product structure in database!" });
            }

            const updatedArray = [...currentData.allProducts, {
                name: updatedData.productName, 
                newPrice: updatedData.newPrice, 
                oldPrice: updatedData.oldPrice, 
                category: updatedData.category, 
                tags: updatedData.tags, 
                image: updatedData.image, 
                id: updatedData.id,
                description: updatedData.description,
            }];

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



