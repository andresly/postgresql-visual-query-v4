import pg from 'pg';

const connectToDatabase = async (req, res) => {
  const db = new pg.Client({
    database: req.body.database,
    user: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
  });

  db.connect().catch((err) => {
    if (err) {
      if (err.code === 'ENOTFOUND') {
        res.status(502).json({ message: 'Error: Host not found (code: ENOTFOUND)' });
      } else if (err.code === 'ETIMEDOUT') {
        res.status(504).json({ message: 'Error: Connection timed out (code: ETIMEDOUT)' });
      } else {
        console.log('err', err);
        res.status(500).json({ message: 'Error: Something went wrong (code: UNEXPECTED)' });
      }
    }
  });

  return db;
};

export const connectToPostgres = async (req, res) => {
  const data = {
    database: 'postgres',
    user: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
  };

  const db = new pg.Client(data);

  try {
    await db.connect();
    return db;
  } catch (err) {
    console.error('Database connection error:', err);
    if (err.code === 'ENOTFOUND') {
      res.status(502).json({ message: 'Error: Host not found (code: ENOTFOUND)' });
    } else if (err.code === 'ETIMEDOUT') {
      res.status(504).json({ message: 'Error: Connection timed out (code: ETIMEDOUT)' });
    } else {
      res.status(500).json({
        message: `Error: ${err.message} (code: ${err.code || 'UNEXPECTED'})`,
      });
    }
    throw err; // Re-throw the error to be caught in the route handler
  }
};

export default connectToDatabase;
