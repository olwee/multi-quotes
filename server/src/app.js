import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import db from './models/db';
import Repo from './repo';
import Models from './models';
import routes from './routes';

dotenv.config();

const App = async (loaders) => {
  const {
    ws,
  } = await loaders();
  const pool = await db.setup();
  // Start Feed Handler
  await Repo.FeedHandler({ ws, pool, Models });
  // Start server
  const app = express();
  app.use(cors());
  app.use('/api/v1', routes({ pool, Models }));

  const port = process.env.PORT ? process.env.PORT : 3000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started on ${port}`);
  });
  return app;
};

export default App;
