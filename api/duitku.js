const crypto = require("crypto");
const axios = require("axios");

module.exports = async (req, res) => {

  const merchantCode = process.env.DUITKU_MERCHANT_CODE;
  const apiKey = process.env.DUITKU_API_KEY;

  const { orderId, paymentAmount, productDetails, email } = req.body;

  const signatureString =
    `${merchantCode}${orderId}${paymentAmount}${apiKey}`;

  const signature = crypto
    .createHash("md5")
    .update(signatureString)
    .digest("hex");

  const payload = {
    merchantCode,
    paymentAmount,
    merchantOrderId: orderId,
    productDetails,
    email,
    signature,
    returnUrl: "https://google.com"
  };

  try {

    const response = await axios.post(
      "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry",
      payload,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json(response.data);

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });

  }
};