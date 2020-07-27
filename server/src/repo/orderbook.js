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

  return {
    cache,
    add,
  };
};

export {
  LimitLevel,
  LimitLevelList,
};
