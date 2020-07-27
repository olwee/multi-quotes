import {
  sql,
  NotFoundError,
  DataIntegrityError,
} from 'slonik';

// eslint-disable-next-line no-unused-vars
const Quote = (
  id,
  bestBidPx,
  bestAskPx,
  bestBidQty,
  bestAskQty,
  baSpread,
  lastUpdated,
) => ({
  id,
  bestBidPx,
  bestAskPx,
  bestBidQty,
  bestAskQty,
  baSpread,
  lastUpdated,
});

Quote.Up = async (conn) => {
  // Create Seq
  await conn.query(sql`
    CREATE SEQUENCE quotes_id_seq;
  `);
  // Create Table
  await conn.query(sql`
    CREATE TABLE quotes(
      id int PRIMARY KEY NOT NULL DEFAULT nextval('quotes_id_seq'),
      best_bid_px int NOT NULL,
      best_ask_px int NOT NULL,
      best_bid_qty int NOT NULL,
      best_ask_qty int NOT NULL,
      ba_spread int NOT NULL,
      last_updated bigint NOT NULL
    );
  `);
  // Assign Seq
  await conn.query(sql`
    ALTER SEQUENCE quotes_id_seq OWNED BY quotes.id;
  `);
};

Quote.Down = async (conn) => {
  await conn.query(sql`
    DROP TABLE quotes;
  `);
};

Quote.createOne = (conn) => async (
  bestBidPx,
  bestAskPx,
  bestBidQty,
  bestAskQty,
  baSpread,
  lastUpdated,
) => {
  const res = await conn.query(sql`
    INSERT INTO quotes (
      best_bid_px,
      best_ask_px,
      best_bid_qty,
      best_ask_qty,
      ba_spread,
      last_updated
    )
    VALUES (${sql.join([
    bestBidPx,
    bestAskPx,
    bestBidQty,
    bestAskQty,
    baSpread,
    lastUpdated,
  ], sql`, `)})
    RETURNING id;
  `);
  const { rows: { 0: { id } } } = res;
  return Quote(
    id,
    bestBidPx,
    bestAskPx,
    bestBidQty,
    bestAskQty,
    baSpread,
    lastUpdated,
  );
};

Quote.getLatest = (conn) => async () => {
  let result = null;
  try {
    result = await conn.one(sql`
      SELECT * FROM quotes
      ORDER BY last_updated DESC
      LIMIT 1;
    `);
  } catch (err) {
    if (err instanceof NotFoundError) return result;
    if (err instanceof DataIntegrityError) return result;
  }
  return Quote(
    result.id,
    result.best_bid_px,
    result.best_ask_px,
    result.best_bid_qty,
    result.best_ask_qty,
    result.ba_spread,
    result.last_updated,
  );
};

export default Quote;
