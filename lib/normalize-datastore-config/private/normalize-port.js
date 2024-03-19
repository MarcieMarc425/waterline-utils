/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('lodash');
var flaverr = require('marciemarc425-flaverr');

/**
 * normalizePort()
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param  {Ref}   port
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @returns  {Number}
 *           The normalized value.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @throws {E_BAD_CONFIG} If cannot be normalized.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

module.exports = function normalizePort(port) {
  assert(!_.isUndefined(port), 'Should be defined');

  if (_.isString(port)) {
    port = +port;
  } //>-

  if (
    !_.isNumber(port) ||
    _.isNaN(port) ||
    port < 1 ||
    Math.floor(port) !== port
  ) {
    throw flaverr(
      'E_BAD_CONFIG',
      new Error(
        'Invalid port (`' +
          util.inspect(port) +
          '`).  Must be a positive number.'
      )
    );
  }

  return port;
};
