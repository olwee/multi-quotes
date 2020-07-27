import WebSocket from 'ws';
import { randomInt } from '../utils';

const Feed = async (wsURL) => {
  const ws = new WebSocket(wsURL);
  ws.on('open', async () => {
    let reqId = await randomInt();
    ws.send(JSON.stringify({
      id: reqId,
      method: 'server.ping',
      params: [],
    }));

    reqId = await randomInt();
    ws.send(JSON.stringify({
      id: reqId,
      method: 'depth.subscribe',
      params: ['BTCUSDT', 50, '0.01'],
    }));
  });

  ws.on('message', (data) => {
    console.log(data);
  });
};

export default Feed;
