/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('lodash');
var flaverr = require('marciemarc425-flaverr');

/**
 * normalizeUser()
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param  {Ref}   user
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @returns  {String}
 *           The normalized value.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @throws {E_BAD_CONFIG} If cannot be normalized.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

module.exports = function normalizeUser(user) {
  assert(!_.isUndefined(user), 'Should be defined');

  if (_.isNumber(user)) {
    user = '' + user;
  } //>-

  if (!_.isString(user)) {
    throw flaverr(
      'E_BAD_CONFIG',
      new Error(
        'Invalid user (`' + util.inspect(user) + '`).  Must be a string.'
      )
    );
  }

  return user;
};
