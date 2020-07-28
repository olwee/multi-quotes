import { assert } from 'chai';
import {
  LimitLevel,
  LimitLevelList,
  Orderbook,
} from '../../repo/orderbook';
import feedFixtures from './multi_fixtures';
import Feeds from '../../repo/feeds/index';

describe('# Orderbook Unit Tests', () => {
  describe('# LimitLevelList - Add', () => {
    it('should add 1 limitLevel to the limitLevelList', () => {
      const limLev1 = LimitLevel(1000, 10, false);
      const limLevList = LimitLevelList(false);
      limLevList.add(limLev1);
      assert.equal(limLevList.cache.head.px, 1000);
    });
    it('should add 2 limitLevels to the limitLevelList', () => {
      const limLev1 = LimitLevel(1000, 10, false);
      const limLev2 = LimitLevel(1002, 5, false);
      const limLevList = LimitLevelList(false);
      limLevList.add(limLev1);
      limLevList.add(limLev2);
      assert.equal(limLevList.cache.head.px, 1000);
      assert.equal(limLevList.cache.tail.px, 1002);

      assert.equal(limLevList.cache.tail.getPrev().px, 1000);
      assert.equal(limLevList.cache.head.getNext().px, 1002);
    });

    it('should add 3 limitLevels to the limitLevelList', () => {
      const limLev1 = LimitLevel(1000, 10, false);
      const limLev2 = LimitLevel(1002, 5, false);
      const limLev3 = LimitLevel(1001, 5, false);
      const limLevList = LimitLevelList(false);
      limLevList.add(limLev1);
      limLevList.add(limLev2);
      limLevList.add(limLev3);
      assert.equal(limLevList.cache.head.px, 1000);
      assert.equal(limLevList.cache.tail.px, 1002);

      assert.equal(limLevList.cache.tail.getPrev().px, 1001);
      assert.equal(limLevList.cache.head.getNext().px, 1001);
    });
  }); // End Of LimitLevelList Add
  describe('# LimitLevelList - Remove', () => {
    let limLevList = {};
    let limLev1 = {};
    let limLev2 = {};
    let limLev3 = {};
    let limLev4 = {};
    beforeEach(() => {
      //
      limLev1 = LimitLevel(1000, 10, false);
      limLev2 = LimitLevel(1001, 5, false);
      limLev3 = LimitLevel(1002, 25, false);
      limLev4 = LimitLevel(1003, 15, false);
      limLevList = LimitLevelList(false);
      limLevList.add(limLev1);
      limLevList.add(limLev2);
      limLevList.add(limLev3);
      limLevList.add(limLev4);
    });
    it('should remove the head limitLevel', () => {
      limLevList.remove(limLev1);
      assert.equal(limLevList.cache.head.px, 1001);
    });
    it('should remove the tail limitLevel', () => {
      limLevList.remove(limLev4);
      assert.equal(limLevList.cache.head.px, 1000);
      assert.equal(limLevList.cache.tail.px, 1002);
    });
    it('should be able to get levels', () => {
      const levels = limLevList.getLevels();
      assert.deepEqual(levels, [
        [1000, 10],
        [1001, 5],
        [1002, 25],
        [1003, 15],
      ]);
    });
  }); // End Of LimitLevelList Remove
  describe('# Orderbook', () => {
    it('should process LimitLevel Updates #1', () => {
      const orderbook = Orderbook();
      const feed = Feeds.MultiFeed();
      //
      const msg1 = JSON.parse(feedFixtures.bookUpdate0);
      const payload1 = feed.handleBookUpdate(msg1.params);
      orderbook.process(payload1);
      let topQuote = orderbook.getBestQuote();
      assert.deepEqual(topQuote, {
        bidPx: 1023928,
        bidQty: 354625,
        askPx: 1024689,
        askQty: 101783,
        spread: 761,
        seq: 0,
        lastUpdated: 0,
      });
      //
      const msg2 = JSON.parse(feedFixtures.bookUpdate1);
      const payload2 = feed.handleBookUpdate(msg2.params);
      orderbook.process(payload2);
      topQuote = orderbook.getBestQuote();
      assert.deepEqual(topQuote, {
        bidPx: 1023916,
        bidQty: 135389,
        askPx: 1024689,
        askQty: 101783,
        spread: 773,
        seq: 1,
        lastUpdated: 0,
      });
      //
      const msg3 = JSON.parse(feedFixtures.bookUpdate2);
      const payload3 = feed.handleBookUpdate(msg3.params);
      orderbook.process(payload3);
      topQuote = orderbook.getBestQuote();
      // console.log(topQuote);
      assert.deepEqual(topQuote, {
        bidPx: 1023914,
        bidQty: 135332,
        askPx: 1024689,
        askQty: 101783,
        spread: 775,
        seq: 2,
        lastUpdated: 0,
      });
    }); // End of LimitLevel Updates #1
    it('should process LimitLevel Updates #2', () => {
      const orderbook = Orderbook();
      //
      const payload1 = {
        isSnapshot: true,
        limitLevels: [
          LimitLevel(100, 10, true),
          LimitLevel(101, 10, false),
        ],
        exchTS: 0,
        exchSeq: 1,
      };
      orderbook.process(payload1);
      let topQuote = orderbook.getBestQuote();
      assert.deepEqual(topQuote, {
        bidPx: 100,
        bidQty: 10,
        askPx: 101,
        askQty: 10,
        spread: 1,
        seq: 1,
        lastUpdated: 0,
      });
      const payload2 = {
        isSnapshot: false,
        limitLevels: [
          LimitLevel(99, 10, true),
          LimitLevel(102, 10, false),
        ],
        exchTS: 0,
        exchSeq: 2,
      };
      orderbook.process(payload2);
      topQuote = orderbook.getBestQuote();
      assert.deepEqual(topQuote, {
        bidPx: 100,
        bidQty: 10,
        askPx: 101,
        askQty: 10,
        spread: 1,
        seq: 2,
        lastUpdated: 0,
      });
      const payload3 = {
        isSnapshot: true,
        limitLevels: [
          LimitLevel(99, 5, true),
          LimitLevel(102, 5, false),
        ],
        exchTS: 0,
        exchSeq: 3,
      };
      orderbook.process(payload3);
      topQuote = orderbook.getBestQuote();
      assert.deepEqual(topQuote, {
        bidPx: 99,
        bidQty: 5,
        askPx: 102,
        askQty: 5,
        spread: 3,
        seq: 3,
        lastUpdated: 0,
      });
    }); // End of LimitLevel Updates #2
  });
});
