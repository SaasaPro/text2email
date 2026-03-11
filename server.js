import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/proxy", async (req, res) => {
  const data = req.body;

  const username = "P002:APBXP002";
  const password = "km8vNktCwERc";
  const credentials = Buffer.from(username + ":" + password).toString("base64");

  try {
    const response = await fetch("http://mycloudmms.com:81/api/PhoneNumber", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + credentials
      },
      body: JSON.stringify(data)
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.get("/listProxy", async (req, res) => {
  const search = req.query.search || "";
  const username = "P002:APBXP002";
  const password = "km8vNktCwERc";
  const credentials = Buffer.from(username + ":" + password).toString("base64");

  try {
    const response = await fetch("http://mycloudmms.com:81/api/PhoneNumber?search=" + encodeURIComponent(search), {
      headers: { "Authorization": "Basic " + credentials }
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(3000, () => console.log("Proxy corriendo en puerto 3000"));
