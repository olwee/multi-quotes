// import WebSocket from 'ws';

const Feed = (
  ws,
  {
    onConnect,
    onData,
  },
) => {
  const wsConn = ws();

  const send = async (payload) => {
    wsConn.send(JSON.stringify(payload));
  };
  wsConn.on('open', async () => onConnect({ send, ws: wsConn }));
  wsConn.on('message', async (msg) => onData(msg, { send, ws: wsConn }));
};

export default Feed;
