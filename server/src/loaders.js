import WebSocket from 'ws';

export default async () => {
  const ws = () => new WebSocket(process.env.WS_URI);
  return {
    ws,
  };
};
