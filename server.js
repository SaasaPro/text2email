import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const username = "P002:APBXP002";
const password = "km8vNktCwERc";
const credentials = Buffer.from(username + ":" + password).toString("base64");

// --- POST PhoneNumber y luego EmailUser ---
app.post("/proxy", async (req, res) => {
  const data = req.body;

  try {
    // 1. Crear PhoneNumber
    const phoneResponse = await fetch("http://mycloudmms.com:81/api/PhoneNumber", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + credentials
      },
      body: JSON.stringify(data)
    });

    const phoneText = await phoneResponse.text();

    if (!phoneResponse.ok) {
      return res.status(phoneResponse.status).json({
        error: "Error creando PhoneNumber",
        details: phoneText
      });
    }

    // 2. Crear EmailUser
    const emailData = {
      providerCode: data.providerCode,
      phoneNumber: data.phoneNumber,
      firstName: "SMS",
      lastName: "Number",
      emailAddress: data.deliveryEmailAddress,
      emailFromName: "SMSNUMBER",
      pinCode: "",
      defaultUser: true,
      active: true
    };

    const emailResponse = await fetch("http://mycloudmms.com:81/api/EmailUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + credentials
      },
      body: JSON.stringify(emailData)
    });

    const emailText = await emailResponse.text();

    if (!emailResponse.ok) {
      return res.status(emailResponse.status).json({
        error: "Error creando EmailUser",
        details: emailText
      });
    }

    // 3. Solo si ambos fueron OK
    res.status(200).json({
      phoneNumberResponse: phoneText,
      emailUserResponse: emailText
    });

  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});


// --- GET EmailUser ---
app.get("/proxy/email-users", async (req, res) => {
  try {
    const response = await fetch("http://mycloudmms.com:81/api/EmailUser", {
      headers: {
        "Authorization": "Basic " + credentials
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Error en API externa" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});
app.listen(3000, () => console.log("Proxy corriendo en puerto 3000"));
