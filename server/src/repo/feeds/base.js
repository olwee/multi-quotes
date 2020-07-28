// import WebSocket from 'ws';

const Feed = (
  ws,
  {
    onConnect,
    onData,
  },
) => {
  console.log('baseFeed');
  const wsConn = ws();
  console.log(wsConn);

  const send = async (payload) => {
    wsConn.send(JSON.stringify(payload));
  };
  console.log('Listening to on open, on message');
  wsConn.on('open', async () => onConnect({ send, ws: wsConn }));
  wsConn.on('message', async (msg) => onData(msg, { send, ws: wsConn }));
};

export default Feed;
