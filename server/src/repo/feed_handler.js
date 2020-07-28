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
  const { publisher, ...multiFeedConfig } = Feeds.MultiFeed();
  BaseFeed(ws, multiFeedConfig);
  const LOB = Orderbook();

  publisher.on('book-update', (updatePayload) => {
    // If we get a snapshot,we should flush the whole book
    const localTS = moment.utc().valueOf();
    LOB.process(updatePayload);
    const bestQuote = LOB.getBestQuote();
    const newQuote = quote(bestQuote);
    if (newQuote.toString() !== lastQuote.toString()) {
      const persistQuote = async () => {
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
      };
      persistQuote().catch((err) => console.log(err));
      // Update lastQuote
      Object.assign(lastQuote, newQuote);
    }
  });
};

export default FeedHandler;
