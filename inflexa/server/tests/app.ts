import dotenv from 'dotenv';
import path from 'path';

// Load test env BEFORE any app code imports
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Now import the app (env.ts will see the test vars already loaded)
import app from '../src/server';

export default app;
