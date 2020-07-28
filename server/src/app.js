import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import db from './models/db';
import Repo from './repo';
import Models from './models';
import routes from './routes';

dotenv.config();

const App = async () => {
  const pool = await db.setup();
  pool.connect(async (conn) => {
    // Start Feed Handler
    Repo.FeedHandler({ conn, Models });
    // Start server
    const app = express();
    app.use(cors());
    app.use('/api/v1', routes);
  });
};

export default App;
