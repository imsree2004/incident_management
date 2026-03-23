// import { sendMail } from "./mailer.js";
// import { genericAutoResponse } from "../utils/genericResponseTemplate.js";

// export async function handleAIResponse(complaint) {
//   try {

//     const response = await fetch(
//   `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: `You are an incident management assistant. Respond professionally to this complaint:\n\n${complaint.body}`
//                 }
//               ]
//             }
//           ]
//         })
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(errorText);
//     }

//     const data = await response.json();

//     const text =
//       data.candidates?.[0]?.content?.parts?.[0]?.text ||
//       genericAutoResponse.body;

//     await sendMail(
//       complaint.from,
//       "Response to your complaint",
//       text
//     );

//     complaint.autoResponseSent = true;
//     complaint.autoResponseType = "AI-GEMINI";
//     complaint.autoResponseTime = new Date();
//     complaint.status = "AI-Handled";

//     await complaint.save();

//     console.log("🤖 Gemini AI response sent");

//   } catch (err) {

//     console.error("Gemini Error:", err.message);

//     await sendMail(
//       complaint.from,
//       genericAutoResponse.subject,
//       genericAutoResponse.body
//     );

//     complaint.autoResponseSent = true;
//     complaint.autoResponseType = "GENERIC-FALLBACK";
//     complaint.autoResponseTime = new Date();
//     complaint.status = "Auto-Handled";

//     await complaint.save();

//     console.log("📨 Generic fallback sent");
//   }
// }

import { GoogleGenAI } from "@google/genai";
import { sendMail } from "./mailer.js";
import { genericAutoResponse } from "../utils/genericResponseTemplate.js";

export async function handleAIResponse(complaint) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  try {
    // Generate AI response
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an incident management assistant. 
Respond professionally and concisely to the following complaint:

${complaint.body}`,
            },
          ],
        },
      ],
    });

    console.log("Gemini Raw Response:", response);

    // Extract AI-generated text safely
    const aiText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      genericAutoResponse.body;

    // Send email response
    await sendMail(
      complaint.from,
      "Response to your complaint",
      aiText
    );

    // Update complaint status
    complaint.autoResponseSent = true;
    complaint.autoResponseType = "AI-GEMINI";
    complaint.autoResponseTime = new Date();
    complaint.status = "AI-Handled";

    await complaint.save();

    console.log("🤖 Gemini AI response sent successfully");

  } catch (error) {
    console.error("Gemini Error:", error.message);

    // Fallback to generic response
    await sendMail(
      complaint.from,
      genericAutoResponse.subject,
      genericAutoResponse.body
    );

    complaint.autoResponseSent = true;
    complaint.autoResponseType = "GENERIC-FALLBACK";
    complaint.autoResponseTime = new Date();
    complaint.status = "Auto-Handled";

    await complaint.save();

    console.log("📨 Generic fallback response sent");
  }
}