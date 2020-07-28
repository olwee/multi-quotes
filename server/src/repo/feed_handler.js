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

const FeedHandler = ({ conn, Models }) => {
  const lastQuote = quote({
    bidPx: 0,
    bidQty: 0,
    askPx: 0,
    askQty: 0,
  });
  const wsURI = process.env.WS_URI;
  const LOB = Orderbook();
  const { publisher, ...multiFeedConfig } = Feeds.MultiFeed();
  BaseFeed(wsURI, multiFeedConfig);

  const quoteCreator = Models.Quote.createOne(conn);

  publisher.on('book-update', async (updatePayload) => {
    LOB.process(updatePayload);
    const bestQuote = LOB.getBestQuote();
    const newQuote = quote(bestQuote);
    if (newQuote.toString() !== lastQuote.toString()) {
      await quoteCreator(
        bestQuote.bidPx,
        bestQuote.askPx,
        bestQuote.bidQty,
        bestQuote.askQty,
        bestQuote.spread,
        bestQuote.exchSeq,
      );
      // Update lastQuote
      Object.assign(lastQuote, newQuote);
    }
  });
};

export default FeedHandler;
