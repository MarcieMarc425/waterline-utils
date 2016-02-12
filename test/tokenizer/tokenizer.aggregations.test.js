var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('Aggregations', function() {
    it('should generate a valid token array for GROUP BY', function(done) {
      Tokenizer({
        expression: {
          select: '*',
          from: 'users',
          groupBy: ['count']
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' },
          { type: 'IDENTIFIER', value: 'GROUPBY' },
          { type: 'VALUE', value: ['count'] },
          { type: 'ENDIDENTIFIER', value: 'GROUPBY' }
        ]);

        return done();
      });
    });

    it('should generate a valid token array when MIN is used', function(done) {
      Tokenizer({
        expression: {
          min: [
            'active'
          ],
          from: 'users'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'MIN' },
          { type: 'VALUE', value: ['active'] },
          { type: 'ENDIDENTIFIER', value: 'MIN' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' }
        ]);

        return done();
      });
    });

    it('should generate a valid token array when MAX is used', function(done) {
      Tokenizer({
        expression: {
          max: [
            'active'
          ],
          from: 'users'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'MAX' },
          { type: 'VALUE', value: ['active'] },
          { type: 'ENDIDENTIFIER', value: 'MAX' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' }
        ]);

        return done();
      });
    });

    it('should generate a valid token array when SUM is used', function(done) {
      Tokenizer({
        expression: {
          sum: [
            'active'
          ],
          from: 'users'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'SUM' },
          { type: 'VALUE', value: ['active'] },
          { type: 'ENDIDENTIFIER', value: 'SUM' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' }
        ]);

        return done();
      });
    });

    it('should generate a valid token array when AVG is used', function(done) {
      Tokenizer({
        expression: {
          avg: [
            'active'
          ],
          from: 'users'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'AVG' },
          { type: 'VALUE', value: ['active'] },
          { type: 'ENDIDENTIFIER', value: 'AVG' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' }
        ]);

        return done();
      });
    });
  });
});
