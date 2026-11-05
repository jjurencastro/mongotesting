/**
 * MongoDB Atlas connection-string diagnostic tool.
 *
 * Run it yourself in the terminal (paste YOUR OWN connection string):
 *
 *   MONGODB_URI="mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/" node test-connection.js
 *
 * It checks the URI for common copy-paste mistakes WITHOUT printing your
 * password, then attempts a real connection.
 */

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error(
    '❌ MONGODB_URI is empty. Run like:\n' +
    '   MONGODB_URI="your-connection-string" node test-connection.js'
  );
  process.exit(1);
}

// ---------- Static checks (password is never printed) ----------
const problems = [];

if (uri.startsWith('"') || uri.startsWith("'") || uri.endsWith('"') || uri.endsWith("'"))
  problems.push("URI is wrapped in quotes — remove them");
if (uri !== uri.trim())
  problems.push("URI has leading/trailing whitespace or a hidden newline");
if (uri.includes("<") || uri.includes(">"))
  problems.push("URI still contains < or > — replace <password> INCLUDING the brackets");
if (!uri.startsWith("mongodb+srv://") && !uri.startsWith("mongodb://"))
  problems.push("URI must start with mongodb+srv:// (Atlas → Connect → Drivers → Node.js)");

const m = uri.match(/^mongodb(?:\+srv)?:\/\/([^@]*)@(.+)$/);
if (!m) {
  problems.push("No credentials@host section found — malformed URI");
} else {
  if (m[2].includes("@"))
    problems.push("Extra '@' after credentials — your password contains an unencoded '@' (encode as %40 or use letters/numbers only)");
  const idx = m[1].indexOf(":");
  const username = idx === -1 ? m[1] : m[1].slice(0, idx);
  const password = idx === -1 ? "" : m[1].slice(idx + 1);
  if (!username) problems.push("Username is empty");
  if (idx === -1) problems.push("No ':' separating username and password");
  if (/[^a-zA-Z0-9]/.test(password))
    problems.push("Password contains non-alphanumeric characters — URL-encode them, or set a letters/numbers-only password in Atlas");
  console.log("✓ Host:", m[2].split("/")[0]);
  console.log("✓ Username:", username, "| password length:", password.length);
}

if (problems.length) {
  console.error("\n❌ URI problems found:");
  problems.forEach((p) => console.error("   - " + p));
  process.exit(1);
}

// ---------- Live connection test ----------
console.log("\nURI format looks OK, attempting real connection (8s timeout)...");
const { MongoClient } = require("mongodb");
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

client
  .connect()
  .then(async () => {
    await client.db("admin").command({ ping: 1 });
    console.log("✅ SUCCESS — connected to Atlas and ping succeeded!");
    console.log("→ The string is GOOD. Re-enter it carefully in Vercel env vars (no quotes/spaces) and REDEPLOY.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err.message);
    console.error("→ The string itself is bad, or Atlas Network Access is blocking (needs 0.0.0.0/0).");
    process.exit(1);
  });
