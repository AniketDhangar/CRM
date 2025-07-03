import axios from "axios";

const sendSMS = async (mobile, message) => {
  try {
    const res = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {},
      {
        params: {
          route: "q",
          message: message,
          language: "english",
          numbers: mobile,
        },
        headers: {
          authorization: "iCIhO5pRMqdk6lcHxySTagL8QUuwsV2GjmtWzNAPBfK1Zv73o9chbC9KPAqy4FgZnNEL8IRM1UTmdfvY", // 🔁 Put your key here
        },
      }
    );

    console.log("✅ SMS sent:", res.data);
  } catch (err) {
    console.log("❌ SMS error:", err.response?.data || err.message);
  }
};

export default sendSMS;
