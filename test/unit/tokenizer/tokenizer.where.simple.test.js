var Tokenizer = require('../../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('Simple WHERE statements', function() {
    it('should generate a valid token array', function(done) {
      Tokenizer({
        expression: {
          select: ['id'],
          where: {
            firstName: 'Test',
            lastName: 'User'
          },
          from: 'users'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: 'id' },
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'firstName' },
          { type: 'VALUE', value: 'Test' },
          { type: 'KEY', value: 'lastName' },
          { type: 'VALUE', value: 'User' },
          { type: 'ENDIDENTIFIER', value: 'WHERE' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' }
        ]);

        return done();
      });
    });

    it('should generate a valid token array when used with operators', function(done) {
      Tokenizer({
        expression: {
          select: '*',
          where: {
            votes: { '>': 100 }
          },
          from: 'users'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'votes' },
          { type: 'OPERATOR', value: '>' },
          { type: 'VALUE', value: 100 },
          { type: 'ENDOPERATOR', value: '>' },
          { type: 'ENDIDENTIFIER', value: 'WHERE' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' }
        ]);

        return done();
      });
    });

    it('should generate a valid token array when used with multiple operators', function(done) {
      Tokenizer({
        expression: {
          select: '*',
          where: {
            votes: { '>': 100, '<': 200 }
          },
          from: 'users'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'votes' },
          { type: 'OPERATOR', value: '>' },
          { type: 'VALUE', value: 100 },
          { type: 'ENDOPERATOR', value: '>' },
          { type: 'KEY', value: 'votes' },
          { type: 'OPERATOR', value: '<' },
          { type: 'VALUE', value: 200 },
          { type: 'ENDOPERATOR', value: '<' },
          { type: 'ENDIDENTIFIER', value: 'WHERE' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' }
        ]);

        return done();
      });
    });

    it('should generate a valid token array when used with multiple columns and operators', function(done) {
      Tokenizer({
        expression: {
          select: '*',
          where: {
            votes: { '>': 100 },
            age: { '<': 50 }
          },
          from: 'users'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'votes' },
          { type: 'OPERATOR', value: '>' },
          { type: 'VALUE', value: 100 },
          { type: 'ENDOPERATOR', value: '>' },
          { type: 'KEY', value: 'age' },
          { type: 'OPERATOR', value: '<' },
          { type: 'VALUE', value: 50 },
          { type: 'ENDOPERATOR', value: '<' },
          { type: 'ENDIDENTIFIER', value: 'WHERE' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' }
        ]);

        return done();
      });
    });
  });
});
