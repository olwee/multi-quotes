import EventEmitter from 'events';
import BN from 'bignumber.js';
import { randomInt } from '../../utils';
import { LimitLevel } from '../orderbook';

const MultiFeed = () => {
  const basePrec = 2;
  const pairPrec = 6;

  const baseOffset = BN(`1e${basePrec}`);
  const pairOffset = BN(`1e${pairPrec}`);

  const publisher = new EventEmitter();

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
    const pair = params[3];
    // We receive other pairs from time to time for some reason...
    if (pair !== 'BTCUSDT') {
      return { limitLevels: [], exchTS: 0, exchSeq: -1 };
    }
    const { asks: rawAsks, bids: rawBids } = bookData;
    let limitLevelAsks = [];
    if (typeof rawAsks !== 'undefined') {
      limitLevelAsks = rawAsks.map(([rawPx, rawQty]) => {
        const px = parseInt(BN(rawPx).times(baseOffset).toFixed(), 10);
        const qty = parseInt(BN(rawQty).times(pairOffset).toFixed(), 10);
        return LimitLevel(px, qty, false);
      });
    }
    let limitLevelBids = [];
    if (typeof rawBids !== 'undefined') {
      limitLevelBids = rawBids.map(([rawPx, rawQty]) => {
        const px = parseInt(BN(rawPx).times(baseOffset).toFixed(), 10);
        const qty = parseInt(BN(rawQty).times(pairOffset).toFixed(), 10);
        return LimitLevel(px, qty, true);
      });
    }
    const limitLevels = [...limitLevelAsks, ...limitLevelBids];

    const payload = {
      limitLevels,
      exchTS: 0,
      exchSeq,
    };

    publisher.emit('book-update', payload);
    return payload;
  };

  const msgRouter = {
    'depth.update': handleBookUpdate,
  };

  const onData = async (rawMsg) => {
    const msg = JSON.parse(rawMsg);
    const { method, params } = msg;
    if (Object.prototype.hasOwnProperty.call(msgRouter, method)) {
      msgRouter[method](params);
    }
  };
  return {
    onConnect,
    onData,
    handleBookUpdate,
    publisher,
  };
};

export default MultiFeed;
