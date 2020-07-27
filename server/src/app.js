import dotenv from 'dotenv';
import Feeds from './repo/feeds/index';
import BaseFeed from './repo/feeds/base';

dotenv.config();

const App = async () => {
  const wsURI = process.env.WS_URI;
  BaseFeed(wsURI, Feeds.MultiFeed());
};

export default App;
