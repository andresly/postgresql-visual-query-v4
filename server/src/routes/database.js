import Router from "express-promise-router";
import connectToDatabase, { connectToPostgres } from "../utils.js";
import queries from "../queries.js";

const router = new Router();

router.post("/tables", async (req, res) => {
  const db = await connectToDatabase(req, res);

  db.query(queries.postgre.tables, (err, queryRes) => {
    res.json(queryRes);
    db.end();
  });
});

router.post("/constraints", async (req, res) => {
  const db = await connectToDatabase(req, res);

  db.query(queries.postgre.constraints, (err, queryRes) => {
    res.json(queryRes);
    db.end();
  });
});

router.post("/columns", async (req, res) => {
  const db = await connectToDatabase(req, res);

  db.query(queries.postgre.columns, (err, queryRes) => {
    res.json(queryRes);
    db.end();
  });
});

router.post("/databases", async (req, res) => {
  try {
    const db = await connectToPostgres(req, res);
    await db.query(queries.postgre.databases, (err, queryRes) => {
      if (queryRes && queryRes.rows) {
        // filfer alphabetical order
        queryRes.rows = queryRes.rows.sort((a, b) =>
          a.Name.localeCompare(b.Name),
        );
        queryRes.rows = queryRes.rows.filter(
          (row) => !["postgres", "template0", "template1"].includes(row.Name),
        );
      }
      res.json(queryRes);
      db.end();
    });
  } catch (err) {
    console.error("Error in /databases route:", err);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const db = await connectToPostgres(req, res);
    res.json({ connected: db["_connected"] });
    db.end();
  } catch (err) {
    console.error("Error in /databases route:", err);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

export default router;
