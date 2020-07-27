import BN from 'bignumber.js';
import { randomInt } from '../../utils';
import { LimitLevel } from '../orderbook';

const MultiFeed = () => {
  const basePrec = 2;
  const pairPrec = 6;

  const baseOffset = BN(`1e${basePrec}`);
  const pairOffset = BN(`1e${pairPrec}`);

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

  const handleBookUpdate = (params) => {
    const exchSeq = params[1];
    const bookData = params[2];
    const { asks: rawAsks, bids: rawBids } = bookData;
    const limitLevelAsks = rawAsks.map(([rawPx, rawQty]) => {
      const px = parseInt(BN(rawPx).times(baseOffset).toFixed(), 10);
      const qty = parseInt(BN(rawQty).times(pairOffset).toFixed(), 10);
      return LimitLevel(px, qty, false);
    });
    const limitLevelBids = rawBids.map(([rawPx, rawQty]) => {
      const px = parseInt(BN(rawPx).times(baseOffset).toFixed(), 10);
      const qty = parseInt(BN(rawQty).times(pairOffset).toFixed(), 10);
      return LimitLevel(px, qty, true);
    });
    const limitLevels = [...limitLevelAsks, ...limitLevelBids];
    return {
      limitLevels,
      exchTS: 0,
      exchSeq,
    };
  };

  const onData = async (msg) => {
    console.log(msg);
  };
  return {
    onConnect,
    onData,
    handleBookUpdate,
  };
};

export default MultiFeed;
