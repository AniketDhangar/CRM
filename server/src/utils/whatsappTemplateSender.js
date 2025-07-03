import twilio from "twilio";

const sendTemplateWhatsApp = async (sid, token, from, to, templateSid, variables) => {
  const client = twilio(sid, token);
  try {
    await client.messages.create({
      from: `whatsapp:${from}`,          // ✅ Must have `whatsapp:`
      to: `whatsapp:${to}`,              // ✅ Must have `whatsapp:`
      contentSid: templateSid,           // ✅ Approved template SID
      contentVariables: JSON.stringify(variables), // ✅ Must be a stringified JSON
    });
    console.log("✅ WhatsApp message sent");
  } catch (error) {
    console.error("❌ WhatsApp Send Error:", error);
  }
};

export default sendTemplateWhatsApp;
