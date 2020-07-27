import { randomInt } from '../../utils';

const MultiFeed = () => {
  const onConnect = async ({ send }) => {
    let reqId = await randomInt();
    send({
      id: reqId,
      method: 'server.ping',
      params: [],
    });
    reqId = await randomInt();
    send({
      id: reqId,
      method: 'depth.subscribe',
      params: ['BTCUSDT', 50, '0.01'],
    });
  };

  const onData = async (msg) => {
    console.log(msg);
  };
  return {
    onConnect,
    onData,
  };
};

export default MultiFeed;
