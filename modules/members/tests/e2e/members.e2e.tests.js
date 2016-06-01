'use strict';

describe('Members E2E Tests:', function () {
  describe('Test Members page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/members');
      expect(element.all(by.repeater('member in members')).count()).toEqual(0);
    });
  });
});
