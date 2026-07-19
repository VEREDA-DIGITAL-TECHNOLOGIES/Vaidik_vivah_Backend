import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Normalize Indian phone number to 91XXXXXXXXXX
 */
const normalizePhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    throw new Error("Invalid phone number");
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;

  throw new Error("Phone must be 10 digits or start with 91");
};

/**
 * Send WhatsApp message via Interakt Template API
 */
const sendWhatsApp = async ({ phone, otp, metadata = {} }) => {
  const startTime = Date.now();

  try {
    /* ================= VALIDATION ================= */

    if (!process.env.INTERAKT_API_KEY) {
      throw new Error("Missing INTERAKT_API_KEY");
    }

    if (!phone) throw new Error("Phone is required");
    if (!otp) throw new Error("OTP is required");

    const normalized = normalizePhone(phone);

    const payload = {
      countryCode: "+91",
      phoneNumber: normalized.slice(2),
      callbackData: "otp-login",
      type: "Template",
      template: {
        name: "whatsapp_login_otp_template",
        languageCode: "en",
        bodyValues: [otp],
        buttonValues: {
          0: [otp],
        },
      },
    };

    /* ================= API CALL ================= */

    const response = await axios.post(
      "https://api.interakt.ai/v1/public/message/",
      payload,
      {
        headers: {
          Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const duration = Date.now() - startTime;

    console.log("WhatsApp sent", {
      phone: normalized,
      duration,
      metadata,
    });

    return response.data;

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error("WhatsApp error", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      duration,
      metadata,
    });

    throw error;
  }
};

export default sendWhatsApp;