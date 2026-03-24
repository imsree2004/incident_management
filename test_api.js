import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const SECRET = "test";

// Admin token
const adminToken = jwt.sign({ id: 1, role: "admin" }, SECRET, { expiresIn: "1h" });
console.log("Admin token:", adminToken);

async function testAdmin() {
  const res = await fetch("http://localhost:5000/api/dashboard/metrics", {
    headers: { "Authorization": `Bearer ${adminToken}` }
  });
  const text = await res.text();
  console.log("Admin Metrics Response:", res.status, text);
}

// Agent token
const agentToken = jwt.sign({ id: 2, role: "agent" }, SECRET, { expiresIn: "1h" });
console.log("Agent token:", agentToken);

async function testAgent() {
  const res = await fetch("http://localhost:5000/api/tickets/metrics", {
    headers: { "Authorization": `Bearer ${agentToken}` }
  });
  const text = await res.text();
  console.log("Agent Metrics Response:", res.status, text);
}

(async () => {
    try {
        await testAdmin();
        await testAgent();
    } catch(e) {
        console.error("Fetch threw", e);
    }
})();
