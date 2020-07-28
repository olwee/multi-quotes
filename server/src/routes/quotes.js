import { Router } from 'express';
import BN from 'bignumber.js';

export default ({ pool, Models }) => {
  const basePrec = 2;
  const pairPrec = 6;
  const baseOffset = BN(`1e${basePrec}`);
  const pairOffset = BN(`1e${pairPrec}`);

  const router = Router();
  router.get('/', async (req, res) => {
    // Fetch latest quote from DB
    await pool.connect(async (conn) => {
      const quoteRaw = await Models.Quote.getLatest(conn)();
      if (quoteRaw === null) return res.json({ error: 'No quotes available', result: {} });
      const {
        bestBidPx: bidPxRaw,
        bestBidQty: bidQtyRaw,
        bestAskPx: askPxRaw,
        bestAskQty: askQtyRaw,
        baSpread: spreadRaw,
        exchSeq,
        lastUpdated,
      } = quoteRaw;

      const bidPx = BN(bidPxRaw).div(baseOffset).toFixed();
      const askPx = BN(askPxRaw).div(baseOffset).toFixed();
      const bidQty = BN(bidQtyRaw).div(pairOffset).toFixed();
      const askQty = BN(askQtyRaw).div(pairOffset).toFixed();
      const spread = BN(spreadRaw).div(baseOffset).toFixed();

      return res.json({
        error: null,
        result: {
          bidPx,
          askPx,
          bidQty,
          askQty,
          spread,
          seq: exchSeq,
          lastUpdated,
        },
      });
    });
  });

  return router;
};
