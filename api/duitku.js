const crypto = require("crypto");
const axios = require("axios");

module.exports = async (req, res) => {
    // Pastikan request berupa POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Gunakan method POST' });
    }

    // Mengambil rahasia dari Vercel nanti
    const merchantCode = process.env.DUITKU_MERCHANT_CODE;
    const apiKey = process.env.DUITKU_API_KEY;
    
    // Menerima data pesanan dari web depan
    const { orderId, paymentAmount, productDetails, email, returnUrl } = req.body;

    // Rumus MD5 standar Duitku
    const signatureString = `${merchantCode}${orderId}${paymentAmount}${apiKey}`;
    const signature = crypto.createHash("md5").update(signatureString).digest("hex");

    // Menyiapkan data untuk dikirim ke Duitku
    const payload = {
        merchantCode: merchantCode,
        paymentAmount: paymentAmount,
        merchantOrderId: orderId,
        productDetails: productDetails || "Barang Toko",
        email: email || "user@email.com",
        signature: signature,
        returnUrl: returnUrl || "https://google.com" 
    };

    try {
        // Menembak server Duitku mode Sandbox (Testing)
        const response = await axios.post("https://api-sandbox.duitku.com/api/merchant/createinvoice", payload);
        res.status(200).json({ success: true, paymentUrl: response.data.paymentUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal menyambung ke Duitku" });
    }
};