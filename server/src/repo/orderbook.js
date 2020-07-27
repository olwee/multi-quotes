// const clone = (x) => JSON.parse(JSON.stringify(x));

const LimitLevel = (
  px,
  qty,
  isBid,
) => {
  let prev = null;
  let next = null;

  const remove = () => {
    if (next !== null) next.setPrev(prev);
    if (prev !== null) prev.setNext(next);
  };

  const setPrev = (val) => {
    prev = val;
  };

  const setNext = (val) => {
    next = val;
  };

  const getPrev = () => prev;
  const getNext = () => next;

  return {
    px,
    qty,
    isBid,
    remove,
    setPrev,
    setNext,
    getPrev,
    getNext,
  };
};

const LimitLevelList = (
  isBid = false,
) => {
  const diffOffset = isBid === true ? 1 : -1;
  const cache = {
    head: null,
    tail: null,
  };

  const add = (limitLevel) => {
    if (cache.head !== null) {
      if (((limitLevel.px - cache.head.px) * diffOffset) > 0) {
        // Incoming limitLevel is at a better price than current head
        limitLevel.setPrev(null);
        limitLevel.setNext(cache.head);
        cache.head.setPrev(limitLevel);
        cache.head = limitLevel;
      } else if (((limitLevel.px - cache.tail.px) * diffOffset) < 0) {
        // Incoming limitLevel is at a worse price than current tail
        limitLevel.setPrev(cache.tail);
        limitLevel.setNext(null);
        cache.tail.setNext(limitLevel);
        cache.tail = limitLevel;
      } else {
        let current = cache.head;
        while (current !== null) {
          if (((limitLevel.px - current.px) * diffOffset) > 0) {
            limitLevel.setPrev(current.getPrev());
            current.setPrev(limitLevel);
            limitLevel.getPrev().setNext(limitLevel);
            limitLevel.setNext(current);
            break;
          }
          current = current.getNext();
        }
      }
      return;
    }
    cache.head = limitLevel;
    cache.tail = limitLevel;
  };

  const remove = (limitLevel) => {
    if (limitLevel.px === cache.head.px) {
      cache.head = limitLevel.getNext();
    } else if (limitLevel.px === cache.tail.px) {
      cache.tail = limitLevel.getPrev();
    }
    limitLevel.remove();
  };

  const getLevels = (max = 300) => {
    let counter = 0;
    const levels = [];
    let current = cache.head;
    while (current !== null && counter < max) {
      levels.push([current.px, current.qty]);
      current = current.getNext();
      counter += 1;
    }
    return levels;
  };

  return {
    cache,
    add,
    remove,
    getLevels,
  };
};

const Orderbook = () => {
  const cache = {
    pxMap: {},
    bids: LimitLevelList(true),
    asks: LimitLevelList(false),
    seq: 0,
    lastUpdated: 0,
  };

  const processSingle = (limitLevel) => {
    const { px, qty, isBid } = limitLevel;
    const savedLevel = cache.pxMap[px];
    if (qty === 0) {
      // Remove
      if (typeof savedLevel !== 'undefined') {
        if (savedLevel.isBid === true) {
          cache.bids.remove(savedLevel);
        } else {
          cache.asks.remove(savedLevel);
        }
        delete cache.pxMap[px];
      }
      return;
    }
    if (typeof savedLevel !== 'undefined') {
      // Update
      savedLevel.qty = qty;
      return;
    }
    // Add
    cache.pxMap[px] = limitLevel;
    if (isBid === true) cache.bids.add(limitLevel);
    if (isBid === false) cache.asks.add(limitLevel);
  };

  const process = ({
    limitLevels,
    exchTS,
    exchSeq,
  }) => {
    limitLevels.forEach((limitLevel) => {
      processSingle(limitLevel);
    });
    cache.seq = exchSeq;
    cache.lastUpdated = exchTS;
  };

  const getBestQuote = () => {
    const askLevels = cache.asks.getLevels(1);
    const bidLevels = cache.bids.getLevels(1);
    const [[bestAskPx, bestAskQty]] = askLevels;
    const [[bestBidPx, bestBidQty]] = bidLevels;
    const spread = bestAskPx - bestBidPx;
    return {
      bidPx: bestBidPx,
      bidQty: bestBidQty,
      askPx: bestAskPx,
      askQty: bestAskQty,
      spread,
      seq: cache.seq,
      lastUpdated: cache.lastUpdated,
    };
  };

  return {
    process,
    getBestQuote,
  };
};

export {
  LimitLevel,
  LimitLevelList,
  Orderbook,
};
