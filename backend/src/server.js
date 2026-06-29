import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`CartForge API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
