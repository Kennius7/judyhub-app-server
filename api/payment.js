
export default async function handler(req, res) {
    console.log("Checking...");
    // console.log("Request API Type:>>>", req.body);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        console.log("Checking OPTIONS Method...", res.statusCode);
        return;
    }

    if (req.method === "POST") {
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
        const { email, amount } = req.body;

        try {
            const response = await fetch("https://api.paystack.co/transaction/initialize", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    amount, // Paystack requires amount in kobo (1 NGN = 100 kobo)
                    currency: "NGN",
                    callback_url: "https://yourwebsite.com/order-confirmation", // Redirect URL after payment
                }),
            });

            const data = await response.json();

            if (data.status) {
                return res.status(200).json({ success: true, authorization_url: data.data.authorization_url });
            } else {
                return res.status(400).json({ success: false, message: data.message });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: "Server error. Please try again." });
        }
    }

    if (req.method === "GET") {
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
        const { reference } = req.query;

        if (!reference) {
            return res.status(400).json({ success: false, message: "No payment reference provided" });
        }

        try {
            const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (data.status && data.data.status === "success") {
                return res.status(200).json({ success: true, message: "Payment verified successfully" });
            } else {
                return res.status(400).json({ success: false, message: "Payment verification failed" });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: "Server error. Please try again." });
        }
    }

    if (!['POST', 'GET', 'OPTIONS'].includes(req.method)) {
        console.log("Checking NO METHOD SELECTED...", res.statusCode);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}





export default async function handler(req, res) {
    if (req.method !== "GET") {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }
  
    
  }
  




