import { assert } from 'chai';
import { LimitLevel, LimitLevelList } from '../../repo/orderbook';

describe('# Orderbook Unit Tests', () => {
  describe('# LimitLevelList', () => {
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
  });
});
