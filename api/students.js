/**
 * Vercel Serverless Function — full CRUD API for the "students" collection.
 *
 *   GET    /api/students              → list all (optional ?course= or ?name= filters)
 *   POST   /api/students              → create  { name, age, course, subjects?, enrolled? }
 *   PUT    /api/students              → update  { id, ...fieldsToChange }
 *   DELETE /api/students?id=<id>      → delete one
 */
const { ObjectId } = require("mongodb");
const { getDb } = require("../lib/mongodb");

module.exports = async (req, res) => {
  try {
    const db = await getDb();
    const students = db.collection("students");

    // ---------- READ ----------
    if (req.method === "GET") {
      const filter = {};
      if (req.query.course) filter.course = req.query.course;
      if (req.query.name) filter.name = new RegExp(req.query.name, "i");
      const docs = await students.find(filter).toArray();
      return res.status(200).json(docs);
    }

    // ---------- CREATE ----------
    if (req.method === "POST") {
      const { name, age, course, subjects = [], enrolled = true } = req.body || {};
      if (!name || age == null || !course) {
        return res.status(400).json({ error: "name, age, and course are required" });
      }
      const doc = { name, age: Number(age), course, subjects, enrolled };
      const result = await students.insertOne(doc);
      return res.status(201).json({ _id: result.insertedId, ...doc });
    }

    // ---------- UPDATE ----------
    if (req.method === "PUT") {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: "id is required" });
      delete updates._id;
      if (updates.age != null) updates.age = Number(updates.age);
      const result = await students.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );
      return res.status(200).json({ matched: result.matchedCount, modified: result.modifiedCount });
    }

    // ---------- DELETE ----------
    if (req.method === "DELETE") {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: "id is required" });
      const result = await students.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ deleted: result.deletedCount });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
