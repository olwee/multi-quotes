import path from 'path';
import Umzug from 'umzug';
import { createPool } from 'slonik';
import Models from './index';

const getAgent = async (connPool) => {
  const migrationDir = path.resolve(__dirname, '../migrations');
  const umzugPath = path.resolve(process.env.DATA_DIR, 'umzug.json');
  const umzug = new Umzug({
    storage: 'json',
    storageOptions: {
      path: umzugPath,
    },
    migrations: {
      params: [
        connPool,
        Models,
      ],
      path: migrationDir,
      pattern: /[^=&#]+.js$/,
    },
  });
  return umzug;
};

const setup = async () => {
  console.log('creating connPool');
  console.log(process.env.DATABASE_URI);
  const connPool = createPool(process.env.DATABASE_URI);
  const agent = await getAgent(connPool);
  console.log('Run migrations');
  const pendingMigrations = await agent
    .pending()
    .map(({ file }) => file);

  await agent.execute({
    method: 'up',
    migrations: pendingMigrations,
  });

  return connPool;
};

const teardown = async () => {
  const connPool = createPool(process.env.DATABASE_URI);
  const agent = await getAgent(connPool);
  await agent.down({ to: 0 });
};

export default {
  setup,
  teardown,
};
