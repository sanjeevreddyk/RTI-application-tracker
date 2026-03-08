const dotenv = require('dotenv');
const path = require('path');
const app = require('./app');
const connectDb = require('./config/db');

const backendRootEnvPath = path.resolve(__dirname, '..', '.env');
const cwdEnvPath = path.resolve(process.cwd(), '.env');
const envPath = require('fs').existsSync(backendRootEnvPath) ? backendRootEnvPath : cwdEnvPath;
dotenv.config({ path: envPath });

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        `MONGO_URI is missing. Create backend/.env (copy from backend/.env.example) and set MONGO_URI.`
      );
    }
    if (!process.env.JWT_SECRET) {
      throw new Error(
        `JWT_SECRET is missing. Set JWT_SECRET in backend/.env before starting the backend.`
      );
    }

    await connectDb();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
}

start();
