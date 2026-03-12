document.getElementById("phoneForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const providerCode = document.getElementById("providerCode").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const deliveryEmailAddress = document.getElementById("deliveryEmailAddress").value;

  const data = {
    providerCode: providerCode,
    phoneNumber: phoneNumber,
    description: "SMS/MMS enabled for " + phoneNumber,
    deliveryEmailAddress: deliveryEmailAddress,
    imageSizeLimit: 0,
    maxAllowedMessagesOutPerDay: 50,
    maxAllowedImagesOutPerMessage: 5,
    maxTextLength: 1024,
    active: true
  };

try {
  const response = await fetch("https://text2email.onrender.com/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const raw = await response.text();
  console.log("Respuesta cruda:", raw);

  let result;
  try {
    result = JSON.parse(raw);
  } catch {
    result = { rawResponse: raw };
  }
  if (!response.ok) {
    throw new Error(result.error || raw || "Error en la API");
  }

  document.getElementById("result").innerText = "Number added successfully!";

  setTimeout(() => {
    window.location.reload();
  }, 2000);

} catch (error) {
  console.error("Add number failed:", error);
  document.getElementById("result").innerText =
    "Oops, Falco broken the code: " + error.message;
}

});
