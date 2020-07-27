import WebSocket from 'ws';

const Feed = (
  wsURI,
  {
    onConnect,
    onData,
  },
) => {
  const ws = new WebSocket(wsURI);

  const send = async (payload) => {
    ws.send(JSON.stringify(payload));
  };

  ws.on('open', async () => onConnect({ send, ws }));
  ws.on('message', async (msg) => onData(msg, { send, ws }));
};

export default Feed;
