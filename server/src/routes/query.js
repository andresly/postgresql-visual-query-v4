import Router from "express-promise-router";
import connectToDatabase from "../utils.js";

const router = new Router();

router.post("/query", async (req, res) => {
  console.log("req.body", req.body);
  const db = await connectToDatabase(req, res);
  const query = {
    text: req.body.sql,
  };

  try {
    const queryResult = await db.query(query);
    await res.json(queryResult);
  } catch (err) {
    const errorMsg = {
      message: err.message,
      code: err.code,
      position: err.position,
    };
    res.status(400).json(errorMsg);
  } finally {
    db.end();
  }
});

export default router;
