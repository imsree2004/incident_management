import axios from "axios";

const API_URL = "https://adwaithsp24-incident-management-api.hf.space/predict";

export const runML = async (text) => {
  try {
    if (!text || typeof text !=="string" || text.trim()=== ""){
      console.log("⚠️ Invalid text provided to runML:",text);
      return {
        department: "general",
        severity: "low",
        department_confidence: 0.5
      };
    }
    console.log("📤 Sending to ML API:", text);

    const response = await axios.post(API_URL, {
      text: text.trim()
    });

    console.log("🤖 ML API RESPONSE:", response.data);

    const result = response.data;

    // Normalize department
    let department = result.department?.toLowerCase();

    // Map API output to your system
    if (department === "it") department = "technical"; // adjust if needed

    if (!["security", "accounts", "general", "technical"].includes(department)) {
      department = "general";
    }

    // Normalize severity
    const severity = result.severity?.toLowerCase();

    return {
      department,
      severity,
      department_confidence: 0.9 // since API doesn’t give confidence
    };

  } catch (error) {
  console.error("❌ STATUS:", error.response?.status);
  console.error("❌ DATA:", error.response?.data);
  console.error("❌ HEADERS:", error.response?.headers);


    // fallback (VERY IMPORTANT for stability)
    return {
      department: "general",
      severity: "low",
      department_confidence: 0.5
    };
  }
};