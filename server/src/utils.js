import pg from "pg";
import crypto from "crypto";

const decrypt = (text) => {
  const iv = Buffer.from(text.iv, "hex");
  const secret = Buffer.from(
    "f010b843fe6830456476d9ba544246b1063086cb072e4804ece61bb58c551117",
    "hex",
  );
  const encryptedData = Buffer.from(text.encryptedData, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", secret, iv);

  let decrypted = decipher.update(encryptedData);

  decrypted += decipher.final("utf8");

  return decrypted;
};

const connectToDatabase = async (req, res) => {
  const data = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: req.body.user,
    password: req.body.password,
    database: req.body.database,
  };

  console.log({ data });
  const db = new pg.Client(data);

  db.connect().catch((err) => {
    if (err) {
      if (err.code === "ENOTFOUND") {
        res
          .status(502)
          .json({ message: "Error: Host not found (code: ENOTFOUND)" });
      } else if (err.code === "ETIMEDOUT") {
        res
          .status(504)
          .json({ message: "Error: Connection timed out (code: ETIMEDOUT)" });
      } else {
        console.log("err", err);
        res
          .status(500)
          .json({ message: "Error: Something went wrong (code: UNEXPECTED)" });
      }
    }
  });

  return db;
};

export const connectToPostgres = async (req, res) => {
  const data = {
    database: "postgres",
    user: req.body.user,
    password: req.body.password,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
  };

  const db = new pg.Client(data);

  try {
    await db.connect();
    return db;
  } catch (err) {
    console.error("code:", err.code);
    if (err.code === "ENOTFOUND") {
      res
        .status(502)
        .json({ message: "Error: Host not found (code: ENOTFOUND)" });
    } else if (err.code === "ETIMEDOUT") {
      res
        .status(504)
        .json({ message: "Error: Connection timed out (code: ETIMEDOUT)" });
    } else if (err.code === "28000") {
      res.status(401).json({ message: "Invalid username or password" });
    } else {
      res.status(500).json({
        message: `Error: ${err.message} (code: ${err.code || "UNEXPECTED"})`,
      });
    }
    throw err; // Re-throw the error to be caught in the route handler
  }
};

export default connectToDatabase;
