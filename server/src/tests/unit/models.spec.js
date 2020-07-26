import path from 'path';
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
      // Timestamp in microseconds
      const lastUpdated = 1595740700000000;
      await pool.connect(async (conn) => {
        await Models.Quote.createOne(conn)(
          bestBidPx,
          bestAskPx,
          bestBidQty,
          bestAskQty,
          baSpread,
          lastUpdated,
        );
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
