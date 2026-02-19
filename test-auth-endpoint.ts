import dotenv from "dotenv";

// Load .env.local file
dotenv.config({ path: ".env.local" });

async function testAuthEndpoint() {
  try {
    const response = await fetch("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    const text = await response.text();
    console.log("Response:", text);

    if (response.ok) {
      console.log("\n✓ Login successful!");
    } else {
      console.log("\n✗ Login failed");
    }
  } catch (error) {
    console.error("✗ Error:", error);
  }
}

console.log("Testing auth endpoint...");
console.log("Make sure your dev server is running (npm run dev)\n");
testAuthEndpoint();
