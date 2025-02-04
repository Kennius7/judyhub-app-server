const { deleteDoc, doc } = require("firebase/firestore");
const { db } = require("../FirebaseConfig.js");
require('dotenv').config();



export default async function handler(req, res) {
    console.log("Checking...");
    console.log("Request received:", req.method);
    
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");

    if (req.method === "OPTIONS") {
        console.log("Checking OPTIONS Method...", res.statusCode);
        console.log("Handling OPTIONS request");
        return res.status(204).end();
    }

    if (req.method === "DELETE") {
        try {
            if (!req.body || !req.body.ids) {
                console.log("Request body is missing or invalid.");
                return res.status(400).json({ success: false, message: "Request body is missing or invalid." });
            }

            let { ids } = req.body;

            if (!Array.isArray(ids)) { ids = [ids] }

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                console.log("Invalid or empty ID list");
                return res.status(400).json({ success: false, message: "Invalid or empty ID list" });
            }

            const deletePromises = ids.map(id => deleteDoc(doc(db, "judyhub-products", id.toString())));
            await Promise.all(deletePromises);

            console.log(`✅ Deleted product with IDs: ${ids}`);
            return res.status(200).json({ success: true, message: "Product(s) deleted successfully" });
        } catch (error) {
            console.log("Checking ERROR FETCHING...", res.statusCode, error.message);
            console.error("❌ Error deleting product(s):", error.message);
            return res.status(500).json({ success: false, message: `Couldn't delete product(s). Error: ${error.message}` });
        }
    }

    if (!['POST', 'GET', 'OPTIONS', 'DELETE'].includes(req.method)) {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}


