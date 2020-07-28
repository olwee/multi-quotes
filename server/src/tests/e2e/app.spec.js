import path from 'path';
import request from 'supertest';
import { assert } from 'chai';
import { stub } from 'sinon';
import { createPool, sql } from 'slonik';
import fs from 'fs-extra';
import EventEmitter from 'events';
import db from '../../models/db';
import App from '../../app';
import feedFixtures from '../unit/multi_fixtures';

// Set Env Vars
const dbURI = 'postgresql://postgres:pgdb1234@127.0.0.1:5432';
const dbURIApp = `${dbURI}/postgres`;
process.env.DATABASE_URI = `${dbURI}/testdb`;
process.env.DATA_DIR = path.join(__dirname, '/.test-app-data');
process.env.PORT = 4000;

const wait = (ms) => new Promise((res) => {
  setTimeout(() => res(), ms);
});

describe('# End To End Tests For the App', () => {
  before(async () => {
    // Create test database
    await fs.ensureDir(process.env.DATA_DIR);
    const pool = createPool(dbURIApp);
    await pool.connect(async (conn) => {
      await conn.query(sql`CREATE DATABASE testdb;`);
    });
    await pool.end();
  });
  describe('# App', () => {
    it('should be able to save quotes into database and expose them over REST API', async () => {
      const emitter = new EventEmitter();
      emitter.send = stub();
      const loaders = async () => ({
        ws: () => emitter,
      });
      const app = await App(loaders);
      emitter.emit('open', {});
      emitter.emit('message', feedFixtures.bookUpdate0);
      emitter.emit('message', feedFixtures.bookUpdate1);
      emitter.emit('message', feedFixtures.bookUpdate2);
      await wait(100);
      const result = await request(app)
        .get('/api/v1/quotes')
        .expect(200);
      const { body } = result;
      const { error, result: { lastUpdated, ...quoteRes } } = body;
      assert.equal(error, null);
      assert.deepEqual(quoteRes, {
        bidPx: '10239.14',
        askPx: '10246.89',
        bidQty: '0.135332',
        askQty: '0.101783',
        spread: '7.75',
        seq: 2,
      });
    });
    after(async () => {
      // Teardown Test Database
      await db.teardown();
    });
  });
  after(async () => {
    const pool = createPool(dbURIApp);
    await pool.connect(async (conn) => {
      await conn.query(sql`DROP DATABASE testdb;`);
    });
    await pool.end();
    await fs.remove(process.env.DATA_DIR);
  });
});
