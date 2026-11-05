# MongoDB Exploration — NoSQL Databases Activity

**Chosen NoSQL Database:** MongoDB (Document Database)
**Language used:** Node.js with the official `mongodb` driver

---

## 1. What is MongoDB?

MongoDB is a **document-oriented NoSQL database**. Instead of tables with rows
and columns (like relational databases), MongoDB stores data as **documents**
in **collections**:

| Relational (SQL) | MongoDB (NoSQL)     |
| ---------------- | ------------------- |
| Database         | Database            |
| Table            | Collection          |
| Row              | Document (BSON/JSON)|
| Column           | Field               |

Documents look like JSON objects and can have different fields and nested
structures — no fixed schema required.

### When should you use it?
- Rapidly evolving / flexible data schemas
- Content management, catalogs, user profiles
- Real-time analytics and high-volume logging
- Applications needing horizontal scaling (sharding)

---

## 2. Environment Setup

We run MongoDB in a **Docker container** (no local install needed):

```bash
# Start MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Check it's running
docker ps --filter name=mongodb

# Stop / start it again later
docker stop mongodb
docker start mongodb
```

Node.js project setup:

```bash
npm init -y
npm install mongodb
```

Connection string used in code: `mongodb://localhost:27017`

---

## 3. Running the Demo

**Console CRUD walkthrough** (original activity demo):

```bash
npm run demo        # node crud-demo.js
```

The script [crud-demo.js](crud-demo.js) connects to MongoDB and walks through
**Create, Read, Update, and Delete** using a sample `schoolDB.students`
collection, printing results at each step.

**Web app version** (same CRUD, Vercel-style serverless API + simple UI):

```bash
npm run dev         # → http://localhost:3000
```

- [api/students.js](api/students.js) — serverless function: `GET` (read, with
  `?course=`/`?name=` filters), `POST` (create), `PUT` (update), `DELETE` (delete)
- [public/index.html](public/index.html) — simple UI calling the API
- [lib/mongodb.js](lib/mongodb.js) — shared, cached MongoDB connection
  (uses `MONGODB_URI` env var, falls back to local Docker MongoDB)

---

## 4. CRUD Cheat Sheet (Node.js driver)

| Operation | Method | Example |
| --------- | ------ | ------- |
| **Create** | `insertOne(doc)` / `insertMany([...])` | `students.insertOne({ name: "Ana", age: 22 })` |
| **Read** | `find(filter)` / `findOne(filter)` | `students.find({ course: "BSCS" })` |
| **Update** | `updateOne(filter, update)` / `updateMany(...)` | `students.updateOne({ name: "Ana" }, { $set: { age: 23 } })` |
| **Delete** | `deleteOne(filter)` / `deleteMany(filter)` | `students.deleteOne({ name: "Ana" })` |

### Useful query operators
- `$gt`, `$lt`, `$gte`, `$lte` — comparisons, e.g. `{ age: { $gt: 20 } }`
- `$set` — set field values in updates
- `$push` — append to an array field
- `{ projection: { _id: 0, name: 1 } }` — return only chosen fields

### mongosh shell equivalents (optional)
You can also open the MongoDB shell inside the container
(`docker exec -it mongodb mongosh`) and run:

```javascript
use schoolDB
db.students.insertOne({ name: "Ana", age: 22 })      // Create
db.students.find({ course: "BSCS" })                 // Read
db.students.updateOne({ name: "Ana" }, { $set: { age: 23 } }) // Update
db.students.deleteOne({ name: "Ana" })               // Delete
```

---

## 5. Challenge / Bonus Preparation Notes

- The same `MongoClient` connection code works for the randomized challenge —
  just change the collection name and document fields to fit the scenario.
- **Webpage option:** already included — [public/index.html](public/index.html)
  talks to the serverless CRUD API in [api/students.js](api/students.js).
  UI "no problem applies".
- **Bonus (polyglot persistence):** pair MongoDB with a second database, e.g.
  Redis as a cache in front of MongoDB, and use each for what it does best.

---

## 6. Deploying to Vercel ☁️

Vercel hosts **serverless apps, not databases**, so the database itself lives
on **MongoDB Atlas** (free M0 tier) and Vercel hosts this app.

### Step 1 — Create a free MongoDB Atlas cluster
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → sign up →
   **Build a Database** → choose **M0 Free**.
2. Create a **database user** (username + password) under *Database Access*.
3. Under *Network Access*, allow access from anywhere: add `0.0.0.0/0`
   (required because Vercel functions have dynamic IPs).
4. Click **Connect → Drivers → Node.js** and copy the connection string:
   `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/...`

### Step 2 — Push this repo to GitHub
```bash
git add -A && git commit -m "Vercel serverless CRUD app" && git push
```

### Step 3 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → sign in with GitHub →
   **Add New → Project** → import this repo.
2. No build settings needed — Vercel auto-detects `/public` (static) and
   `/api` (serverless functions).
3. In **Environment Variables**, add:
   - `MONGODB_URI` = your Atlas connection string
   - `MONGODB_DB` = `schoolDB`
4. Click **Deploy**. Your API will be at `https://<project>.vercel.app/api/students`
   and the UI at `https://<project>.vercel.app`.

### Local dev against Atlas (optional)
```bash
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/" npm run dev
```

> ⚠️ Never commit your Atlas password — it only goes in Vercel's env vars or
> your local shell. The repo is protected by [.gitignore](.gitignore).