import path from 'path';
import { assert } from 'chai';
import { createPool, sql } from 'slonik';
import fs from 'fs-extra';
import db from '../../models/db';
import Models from '../../models';

// Set Env Vars
const dbURI = 'postgresql://postgres:pgdb1234@127.0.0.1:5432';
const dbURIApp = `${dbURI}/postgres`;
process.env.DATABASE_URI = `${dbURI}/testdb`;
process.env.DATA_DIR = path.join(__dirname, '/.test-app-data');

describe('# Test Models', () => {
  before(async () => {
    // Create test database
    await fs.ensureDir(process.env.DATA_DIR);
    const pool = createPool(dbURIApp);
    await pool.connect(async (conn) => {
      await conn.query(sql`CREATE DATABASE testdb;`);
    });
    await pool.end();
  });
  describe('# Quotes', () => {
    let pool = {};
    before(async () => {
      pool = await db.setup();
    });
    it('should be able to createOne', async () => {
      // BTCUSDT Base Prec = 2
      // Pair Prec = 6
      const bestBidPx = 100000;
      const bestAskPx = 100100;
      const bestBidQty = 1000000;
      const bestAskQty = 1000000;
      const baSpread = bestAskPx - bestBidPx;
      const exchSeq = 0;
      // Timestamp in microseconds
      const lastUpdated = 1595740700000000;

      const actual = await pool.connect(async (conn) => {
        const result = await Models.Quote.createOne(conn)(
          bestBidPx,
          bestAskPx,
          bestBidQty,
          bestAskQty,
          baSpread,
          exchSeq,
          lastUpdated,
        );
        return result;
      });
      assert.deepEqual(actual, {
        id: 1,
        bestBidPx,
        bestAskPx,
        bestBidQty,
        bestAskQty,
        baSpread,
        exchSeq,
        lastUpdated,
      });
    });
    it('should be able to get the latest quote', async () => {
      // BTCUSDT Base Prec = 2
      // Pair Prec = 6
      const bestBidPx = 100100;
      const bestAskPx = 100200;
      const bestBidQty = 1000000;
      const bestAskQty = 2000000;
      const baSpread = bestAskPx - bestBidPx;
      const exchSeq = 1;
      // Timestamp in microseconds
      const lastUpdated = 1595740800000000;

      const actual = await pool.connect(async (conn) => {
        await Models.Quote.createOne(conn)(
          bestBidPx,
          bestAskPx,
          bestBidQty,
          bestAskQty,
          baSpread,
          exchSeq,
          lastUpdated,
        );
        const result = await Models.Quote.getLatest(conn)();
        return result;
      });
      assert.deepEqual(actual, {
        id: 2,
        bestBidPx,
        bestAskPx,
        bestBidQty,
        bestAskQty,
        baSpread,
        exchSeq,
        lastUpdated,
      });
    });
    after(async () => {
      await db.teardown();
    });
  });
  after(async () => {
    // Teardown Test Database
    const pool = createPool(dbURIApp);
    await pool.connect(async (conn) => {
      await conn.query(sql`DROP DATABASE testdb;`);
    });
    await pool.end();
    await fs.remove(process.env.DATA_DIR);
  });
});
