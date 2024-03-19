/**
 * Module dependencies
 */

var assert = require('assert');
var _ = require('lodash');
var flaverr = require('marciemarc425-flaverr');

/**
 * normalizePassword()
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param  {Ref}   password
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @returns  {String}
 *           The normalized value.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @throws {E_BAD_CONFIG} If cannot be normalized.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

module.exports = function normalizePassword(password) {
  assert(!_.isUndefined(password), 'Should be defined');

  if (!_.isString(password)) {
    throw flaverr(
      'E_BAD_CONFIG',
      new Error('Invalid password.  Must be a string.')
    );
  }

  return password;
};
