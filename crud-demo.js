/**
 * MongoDB CRUD Exploration — NoSQL Databases Activity
 * ---------------------------------------------------
 * Demonstrates the four basic database operations with MongoDB:
 *   C - Create (insert data)
 *   R - Read   (retrieve/query data)
 *   U - Update (modify existing data)
 *   D - Delete (remove data)
 *
 * Run with:  node crud-demo.js
 * Requires:  MongoDB running at mongodb://localhost:27017
 */

const { MongoClient } = require("mongodb");

// Connection string — our MongoDB runs in a Docker container on port 27017
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function main() {
  try {
    // ---------- CONNECT ----------
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    // Use (or create) a database called "schoolDB" and a collection called "students"
    const db = client.db("schoolDB");
    const students = db.collection("students");

    // Clean slate so the demo is repeatable
    await students.deleteMany({});

    // ---------- CREATE (Insert) ----------
    console.log("\n===== CREATE: insertOne & insertMany =====");

    // insertOne — add a single document
    const one = await students.insertOne({
      name: "Juan Dela Cruz",
      age: 20,
      course: "BSCS",
      subjects: ["Programming", "Databases"],
      enrolled: true,
    });
    console.log("Inserted 1 document, _id:", one.insertedId);

    // insertMany — add multiple documents at once
    const many = await students.insertMany([
      { name: "Maria Santos", age: 21, course: "BSIT", subjects: ["Networking"], enrolled: true },
      { name: "Pedro Reyes", age: 19, course: "BSCS", subjects: ["Programming", "Math"], enrolled: true },
      { name: "Ana Lim", age: 22, course: "BSIT", subjects: ["Web Dev"], enrolled: false },
    ]);
    console.log(`Inserted ${many.insertedCount} more documents`);

    // ---------- READ (Query) ----------
    console.log("\n===== READ: find & findOne =====");

    // find({}) — get ALL documents
    console.log("All students:");
    console.table(await students.find({}).toArray());

    // find with a filter — only BSCS students
    console.log("BSCS students only:");
    console.table(await students.find({ course: "BSCS" }).toArray());

    // Query operators — students older than 20 ($gt = greater than)
    console.log("Students older than 20:");
    console.table(await students.find({ age: { $gt: 20 } }).toArray());

    // findOne — get a single matching document
    const maria = await students.findOne({ name: "Maria Santos" });
    console.log("findOne result:", maria);

    // Projection — return only specific fields (hide _id, show name & course)
    console.log("Names and courses only (projection):");
    console.table(
      await students
        .find({}, { projection: { _id: 0, name: 1, course: 1 } })
        .toArray()
    );

    // ---------- UPDATE ----------
    console.log("\n===== UPDATE: updateOne & updateMany =====");

    // updateOne — change Maria's course; $set modifies fields
    const upd1 = await students.updateOne(
      { name: "Maria Santos" },          // filter: which document(s)
      { $set: { course: "BSCS", age: 22 } } // update: what to change
    );
    console.log(`updateOne → matched ${upd1.matchedCount}, modified ${upd1.modifiedCount}`);

    // updateMany — add a "yearLevel" field to every enrolled student
    const upd2 = await students.updateMany(
      { enrolled: true },
      { $set: { yearLevel: 2 } }
    );
    console.log(`updateMany → matched ${upd2.matchedCount}, modified ${upd2.modifiedCount}`);

    // $push — add an item to an array field
    await students.updateOne(
      { name: "Pedro Reyes" },
      { $push: { subjects: "NoSQL Databases" } }
    );
    console.log("After updates:");
    console.table(await students.find({}).toArray());

    // ---------- DELETE ----------
    console.log("\n===== DELETE: deleteOne & deleteMany =====");

    // deleteOne — remove Ana Lim
    const del1 = await students.deleteOne({ name: "Ana Lim" });
    console.log(`deleteOne → deleted ${del1.deletedCount} document`);

    // deleteMany — remove everyone not enrolled
    const del2 = await students.deleteMany({ enrolled: false });
    console.log(`deleteMany → deleted ${del2.deletedCount} documents`);

    console.log("Final collection contents:");
    console.table(await students.find({}).toArray());

    // Count remaining documents
    console.log("Total students now:", await students.countDocuments());
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    // Always close the connection
    await client.close();
    console.log("\n🔌 Connection closed.");
  }
}

main();
