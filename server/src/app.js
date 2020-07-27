import dotenv from 'dotenv';
import Repo from './repo';

dotenv.config();

const App = async () => {
  const feed = Repo.Feed(process.env.WS_URI);
};

export default App;
