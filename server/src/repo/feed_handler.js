import moment from 'moment';
import Feeds from './feeds/index';
import BaseFeed from './feeds/base';
import { Orderbook } from './orderbook';

const quote = ({
  bidPx,
  bidQty,
  askPx,
  askQty,
}) => {
  const toString = () => `${bidPx}-${bidQty}-${askPx}-${askQty}`;
  return { toString };
};

const FeedHandler = ({ ws, pool, Models }) => {
  //
  const lastQuote = quote({
    bidPx: 0,
    bidQty: 0,
    askPx: 0,
    askQty: 0,
  });
  // const wsURI = process.env.WS_URI;
  const LOB = Orderbook();
  const { publisher, ...multiFeedConfig } = Feeds.MultiFeed();
  BaseFeed(ws, multiFeedConfig);

  publisher.on('book-update', async (updatePayload) => {
    LOB.process(updatePayload);
    const localTS = moment.utc().valueOf();
    const bestQuote = LOB.getBestQuote();
    const newQuote = quote(bestQuote);
    if (newQuote.toString() !== lastQuote.toString()) {
      await pool.connect(async (conn) => {
        await Models.Quote.createOne(conn)(
          bestQuote.bidPx,
          bestQuote.askPx,
          bestQuote.bidQty,
          bestQuote.askQty,
          bestQuote.spread,
          bestQuote.seq,
          localTS,
        );
      });
      // Update lastQuote
      Object.assign(lastQuote, newQuote);
    }
  });
  /*
  pool.connect(async (conn) => {

    const quoteCreator = Models.Quote.createOne(conn);

  });
  */
};

export default FeedHandler;
