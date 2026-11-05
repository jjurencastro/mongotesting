/**
 * Local dev server — mimics Vercel's environment without needing the Vercel CLI.
 * Serves the static frontend from /public and routes /api/students to the
 * same serverless function Vercel will run in production.
 *
 * Run with:  npm run dev   →  http://localhost:3000
 * (Uses MONGODB_URI if set, otherwise the local Docker MongoDB.)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const handler = require("./api/students");

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  // --- API route (adapts Node's req/res to Vercel-style helpers) ---
  if (url.pathname === "/api/students") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      req.query = Object.fromEntries(url.searchParams);
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch {
        req.body = {};
      }
      res.status = (code) => ((res.statusCode = code), res);
      res.json = (obj) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(obj));
      };
      handler(req, res);
    });
    return;
  }

  // --- Static files from /public ---
  const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  fs.readFile(path.join(__dirname, "public", file), (err, data) => {
    if (err) {
      res.statusCode = 404;
      return res.end("Not found");
    }
    res.setHeader("Content-Type", "text/html");
    res.end(data);
  });
});

server.listen(3000, () => console.log("Local dev server → http://localhost:3000"));
