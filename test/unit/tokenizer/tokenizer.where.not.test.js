var Tokenizer = require('../../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('WHERE NOT statements', function() {
    it('should generate a valid token array', function() {
      var result = Tokenizer({
        select: ['id'],
        from: 'users',
        where: {
          not: {
            firstName: 'Test',
            lastName: 'User'
          }
        }
      });

      assert.deepEqual(result, [
        { type: 'IDENTIFIER', value: 'SELECT' },
        { type: 'VALUE', value: 'id' },
        { type: 'ENDIDENTIFIER', value: 'SELECT' },
        { type: 'IDENTIFIER', value: 'FROM' },
        { type: 'VALUE', value: 'users' },
        { type: 'ENDIDENTIFIER', value: 'FROM' },
        { type: 'IDENTIFIER', value: 'WHERE' },
        { type: 'CONDITION', value: 'NOT' },
        { type: 'KEY', value: 'firstName' },
        { type: 'VALUE', value: 'Test' },
        { type: 'CONDITION', value: 'NOT' },
        { type: 'KEY', value: 'lastName' },
        { type: 'VALUE', value: 'User' },
        { type: 'ENDIDENTIFIER', value: 'WHERE' }
      ]);
    });

    it('should generate a valid token array when nested NOT statements are used', function() {
      var result = Tokenizer({
        select: '*',
        from: 'users',
        where: {
          or: [
            {
              not: {
                or: [
                  {
                    id: 1
                  },
                  {
                    not: {
                      id: {
                        '>': 10
                      }
                    }
                  }
                ]
              }
            },
            {
              not: {
                name: 'Tester'
              }
            }
          ]
        }
      });

      assert.deepEqual(result, [
        { type: 'IDENTIFIER', value: 'SELECT' },
        { type: 'VALUE', value: '*' },
        { type: 'ENDIDENTIFIER', value: 'SELECT' },
        { type: 'IDENTIFIER', value: 'FROM' },
        { type: 'VALUE', value: 'users' },
        { type: 'ENDIDENTIFIER', value: 'FROM' },
        { type: 'IDENTIFIER', value: 'WHERE' },
        { type: 'CONDITION', value: 'OR' },
        { type: 'GROUP', value: 0 },
        { type: 'CONDITION', value: 'NOT' },
        { type: 'CONDITION', value: 'OR' },
        { type: 'GROUP', value: 0 },
        { type: 'KEY', value: 'id' },
        { type: 'VALUE', value: 1 },
        { type: 'ENDGROUP', value: 0 },
        { type: 'GROUP', value: 1 },
        { type: 'CONDITION', value: 'NOT' },
        { type: 'KEY', value: 'id' },
        { type: 'OPERATOR', value: '>' },
        { type: 'VALUE', value: 10 },
        { type: 'ENDOPERATOR', value: '>' },
        { type: 'ENDGROUP', value: 1 },
        { type: 'ENDCONDITION', value: 'OR' },
        { type: 'ENDGROUP', value: 0 },
        { type: 'GROUP', value: 1 },
        { type: 'CONDITION', value: 'NOT' },
        { type: 'KEY', value: 'name' },
        { type: 'VALUE', value: 'Tester' },
        { type: 'ENDGROUP', value: 1 },
        { type: 'ENDCONDITION', value: 'OR' },
        { type: 'ENDIDENTIFIER', value: 'WHERE' }
      ]);
    });

    it('should generate a valid token array when operators are used', function() {
      var result = Tokenizer({
        select: '*',
        from: 'users',
        where: {
          not: {
            votes: { '>': 100 }
          }
        }
      });

      assert.deepEqual(result, [
        { type: 'IDENTIFIER', value: 'SELECT' },
        { type: 'VALUE', value: '*' },
        { type: 'ENDIDENTIFIER', value: 'SELECT' },
        { type: 'IDENTIFIER', value: 'FROM' },
        { type: 'VALUE', value: 'users' },
        { type: 'ENDIDENTIFIER', value: 'FROM' },
        { type: 'IDENTIFIER', value: 'WHERE' },
        { type: 'CONDITION', value: 'NOT' },
        { type: 'KEY', value: 'votes' },
        { type: 'OPERATOR', value: '>' },
        { type: 'VALUE', value: 100 },
        { type: 'ENDOPERATOR', value: '>' },
        { type: 'ENDIDENTIFIER', value: 'WHERE' }
      ]);
    });

    it('should generate a valid token array when multiple operators are used', function() {
      var result = Tokenizer({
        select: '*',
        from: 'users',
        where: {
          or: [
            { name: 'John' },
            {
              votes: { '>': 100 },
              not: {
                title: 'Admin'
              }
            }
          ]
        }
      });

      assert.deepEqual(result, [
        { type: 'IDENTIFIER', value: 'SELECT' },
        { type: 'VALUE', value: '*' },
        { type: 'ENDIDENTIFIER', value: 'SELECT' },
        { type: 'IDENTIFIER', value: 'FROM' },
        { type: 'VALUE', value: 'users' },
        { type: 'ENDIDENTIFIER', value: 'FROM' },
        { type: 'IDENTIFIER', value: 'WHERE' },
        { type: 'CONDITION', value: 'OR' },
        { type: 'GROUP', value: 0 },
        { type: 'KEY', value: 'name' },
        { type: 'VALUE', value: 'John' },
        { type: 'ENDGROUP', value: 0 },
        { type: 'GROUP', value: 1 },
        { type: 'KEY', value: 'votes' },
        { type: 'OPERATOR', value: '>' },
        { type: 'VALUE', value: 100 },
        { type: 'ENDOPERATOR', value: '>' },
        { type: 'CONDITION', value: 'NOT' },
        { type: 'KEY', value: 'title' },
        { type: 'VALUE', value: 'Admin' },
        { type: 'ENDGROUP', value: 1 },
        { type: 'ENDCONDITION', value: 'OR' },
        { type: 'ENDIDENTIFIER', value: 'WHERE' }
      ]);
    });
  });
});
