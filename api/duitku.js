const crypto = require("crypto");
const axios = require("axios");

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Gunakan method POST' });
    }

    const merchantCode = process.env.DUITKU_MERCHANT_CODE;
    const apiKey = process.env.DUITKU_API_KEY;
    
    const { orderId, paymentAmount, productDetails, email, returnUrl } = req.body;

    const signatureString = `${merchantCode}${orderId}${paymentAmount}${apiKey}`;
    const signature = crypto.createHash("md5").update(signatureString).digest("hex");

    const payload = {
        merchantCode: merchantCode,
        paymentAmount: paymentAmount,
        merchantOrderId: orderId,
        productDetails: productDetails || "Langganan Premium",
        email: email || "user@email.com",
        signature: signature,
        returnUrl: returnUrl || "https://google.com" 
    };

    try {
        const response = await axios.post("https://api-sandbox.duitku.com/api/merchant/createinvoice", payload);
        res.status(200).json({ success: true, paymentUrl: response.data.paymentUrl });
    } catch (error) {
        // Tangkap pesan asli dari Duitku
        const alasanDuitku = error.response && error.response.data ? error.response.data.Message : error.message;
        
        // Lempar ke depan
        res.status(500).json({ success: false, message: "Error dari Duitku: " + alasanDuitku });
    }
};