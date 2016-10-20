//   ██████╗ ██████╗ ███╗   ██╗██╗   ██╗███████╗██████╗ ████████╗███████╗██████╗
//  ██╔════╝██╔═══██╗████╗  ██║██║   ██║██╔════╝██╔══██╗╚══██╔══╝██╔════╝██╔══██╗
//  ██║     ██║   ██║██╔██╗ ██║██║   ██║█████╗  ██████╔╝   ██║   █████╗  ██████╔╝
//  ██║     ██║   ██║██║╚██╗██║╚██╗ ██╔╝██╔══╝  ██╔══██╗   ██║   ██╔══╝  ██╔══██╗
//  ╚██████╗╚██████╔╝██║ ╚████║ ╚████╔╝ ███████╗██║  ██║   ██║   ███████╗██║  ██║
//   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
//
// Takes a Waterline query and converts it into a Waterline statement. The
// difference may sound tiny but it's important. The way Waterline currently
// works is that it takes up to four seperate pieces to build a query: modelName,
// method, criteria, and possibly values.
//
// A Waterline statement is an object that encompasses the entire query. It can
// easily be transformed into a native query such as a SQL string or a Mongo object.

var _ = require('lodash');

module.exports = function convert(options) {
  var model = options.model;
  var method = options.method;
  var criteria = options.criteria;
  var values = options.values;

  // Hold the final query value
  var query = {};

  // Validate options
  if (!model) {
    throw new Error('Convert must contain a model to use to build the query.');
  }

  if (!method) {
    throw new Error('Convert must contain a method to use to build the query.');
  }

  // Validate Criteria Input is a dictionary
  if (criteria && !_.isPlainObject(criteria)) {
    throw new Error('Criteria must be a dictionary.');
  }

  // Validate Criteria Input contains a WHERE clause
  if (criteria && _.keys(criteria).length && !_.has(criteria, 'where')) {
    throw new Error('Criteria must contain a WHERE clause.');
  }


  //  ╔╦╗╔═╗╔╦╗╦╔═╗╦╔═╗╦═╗╔═╗
  //  ║║║║ ║ ║║║╠╣ ║║╣ ╠╦╝╚═╗
  //  ╩ ╩╚═╝═╩╝╩╚  ╩╚═╝╩╚═╚═╝

  if (criteria && _.keys(criteria).length) {
    if (_.has(criteria, 'skip')) {
      query.skip = criteria.skip;
    }

    // Sort should be pre-normalized coming from Waterline
    if (_.has(criteria, 'sort')) {
      query.orderBy = criteria.sort;
    }

    if (_.has(criteria, 'limit')) {
      query.limit = criteria.limit;
    }
  }


  //  ╔╗╔╔═╗╦═╗╔╦╗╔═╗╦  ╦╔═╗╔═╗
  //  ║║║║ ║╠╦╝║║║╠═╣║  ║╔═╝║╣
  //  ╝╚╝╚═╝╩╚═╩ ╩╩ ╩╩═╝╩╚═╝╚═╝
  //
  // Criteria must always contain a top-level AND or OR clause. Check that it
  // exists and if not normalize it. If there is more than one value always wrap
  // it in an AND clause. If there is only a single OR value then it's fine.
  if (criteria && _.keys(criteria).length) {
    var _criteria;

    // Check the key length. If there is more than one key build up an AND clause
    // and wrap up the criteria logic.
    if (_.keys(criteria.where).length > 1 || !_.has(criteria.where, 'or')) {
      _criteria = {
        and: []
      };

      // Build up the WHERE clause by seperating out all of the keys.
      _.each(criteria.where, function processWhereClause(val, key) {
        var obj = {};
        obj[key] = val;
        _criteria.and.push(obj);
      });

      criteria.where = _criteria;
    }
  }


  //  ╔═╗╦═╗╔═╗╔═╗╔╦╗╔═╗
  //  ║  ╠╦╝║╣ ╠═╣ ║ ║╣
  //  ╚═╝╩╚═╚═╝╩ ╩ ╩ ╚═╝
  //
  // Process a CREATE query and build a WQL insert query
  var processCreate = function processCreate() {
    query.into = model;
    query.insert = values || {};
  };


  //  ╔═╗╦╔╗╔╔╦╗
  //  ╠╣ ║║║║ ║║
  //  ╚  ╩╝╚╝═╩╝
  //
  // Process a FIND or FINDONE query and build a WQL select query.
  var processFind = function processFind(criteria) {
    query.select = criteria.select || [];
    query.from = model;
    query.where = criteria.where || {};

    // If an average, max, min, or sum was used, remove any select keys
    if (query.avg || query.max || query.min || query.sum) {
      delete query.select;
    }
  };


  //  ╔╦╗╔═╗╔═╗╔╦╗╦═╗╔═╗╦ ╦
  //   ║║║╣ ╚═╗ ║ ╠╦╝║ ║╚╦╝
  //  ═╩╝╚═╝╚═╝ ╩ ╩╚═╚═╝ ╩
  //
  // Process a DESTROY query and a build a WQL destroy query.
  var processDestroy = function processDestroy(criteria) {
    query.del = true;
    query.from = model;
    query.where = criteria.where || {};
  };


  //  ╦ ╦╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║ ║╠═╝ ║║╠═╣ ║ ║╣
  //  ╚═╝╩  ═╩╝╩ ╩ ╩ ╚═╝
  //
  // Process an UPDATE query and a build a WQL update query.
  var processUpdate = function processUpdate(criteria) {
    query.update = values || {};
    query.using = model;
    query.where = criteria.where || {};
  };


  //  ╔═╗╔═╗╦ ╦╔╗╔╔╦╗
  //  ║  ║ ║║ ║║║║ ║
  //  ╚═╝╚═╝╚═╝╝╚╝ ╩
  //
  // Process a COUNT query and a build a WQL update query.
  var processCount = function processCount(criteria) {
    query.count = values || {};
    query.from = model;
    query.where = criteria.where || {};
  };


  //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔═╗╦  ╦╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ╠═╣╚╗╔╝║╣ ╠╦╝╠═╣║ ╦║╣
  //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╩ ╩ ╚╝ ╚═╝╩╚═╩ ╩╚═╝╚═╝
  //
  // Process an AVERAGE aggregation. In WQL you can only average by one field
  // at a time so if the array contains more than one item, throw an error.
  var processAverage = function processAverage(averageFields) {
    if (_.isArray(averageFields) && averageFields.length > 1) {
      throw new Error('Queries can only contain one average aggregation.');
    }

    var averageColumn;
    if (_.isArray(averageFields)) {
      averageColumn = _.first(averageFields);
    } else {
      averageColumn = averageFields;
    }

    // The column must be a string value to be valid.
    if (!_.isString(averageColumn)) {
      throw new Error('The field to average must be a string.');
    }

    // Set the "avg" query value
    query.avg = averageColumn;
  };


  //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔╦╗╔═╗═╗ ╦
  //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ║║║╠═╣╔╩╦╝
  //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╩ ╩╩ ╩╩ ╚═
  //
  // Process an MAX aggregation. In WQL you can only max by one field
  // at a time so if the array contains more than one item, throw an error.
  var processMax = function processMax(maxFields) {
    if (_.isArray(maxFields) && maxFields.length > 1) {
      throw new Error('Queries can only contain one MAX aggregation.');
    }

    var maxColumn;
    if (_.isArray(maxFields)) {
      maxColumn = _.first(maxFields);
    } else {
      maxColumn = maxFields;
    }

    // The column must be a string value to be valid.
    if (!_.isString(maxColumn)) {
      throw new Error('The field to MAX must be a string.');
    }

    // Set the "max" query value
    query.max = maxColumn;
  };


  //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔╦╗╦╔╗╔
  //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ║║║║║║║
  //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╩ ╩╩╝╚╝
  //
  // Process a MIN aggregation. In WQL you can only min by one field
  // at a time so if the array contains more than one item, throw an error.
  var processMin = function processMin(minFields) {
    if (_.isArray(minFields) && minFields.length > 1) {
      throw new Error('Queries can only contain one MIN aggregation.');
    }

    var minColumn;
    if (_.isArray(minFields)) {
      minColumn = _.first(minFields);
    } else {
      minColumn = minFields;
    }

    // The column must be a string value to be valid.
    if (!_.isString(minColumn)) {
      throw new Error('The field to MIN must be a string.');
    }

    // Set the "min" query value
    query.min = minColumn;
  };


  //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔═╗╦ ╦╔╦╗
  //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ╚═╗║ ║║║║
  //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚═╝╚═╝╩ ╩
  //
  // Process a SUM aggregation. In WQL you can only sum by one field
  // at a time so if the array contains more than one item, throw an error.
  var processSum = function processSum(sumFields) {
    if (_.isArray(sumFields) && sumFields.length > 1) {
      throw new Error('Queries can only contain one SUM aggregation.');
    }

    var sumColumn;
    if (_.isArray(sumFields)) {
      sumColumn = _.first(sumFields);
    } else {
      sumColumn = sumFields;
    }

    // The column must be a string value to be valid.
    if (!_.isString(sumColumn)) {
      throw new Error('The field to SUM must be a string.');
    }

    // Set the "sum" query value
    query.sum = sumColumn;
  };


  //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔═╗╦═╗╦╔╦╗╔═╗╦═╗╦╔═╗
  //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ║  ╠╦╝║ ║ ║╣ ╠╦╝║╠═╣
  //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚═╝╩╚═╩ ╩ ╚═╝╩╚═╩╩ ╩
  //
  // The meat and potatoes of the converter. Takes an existing Waterline
  // criteria object and builds up something that can be used with the
  // Waterline Query Language.
  var processCriteria = function processCriteria(criteria) {
    // Loop through the criteria looking for IN arrays
    _.each(criteria, function process(val, key) {
      // Normalize ! to NOT
      if (key === '!') {
        delete criteria[key];
        criteria.not = val;
        key = 'not';
      }

      // If this is a LIKE query, just run through the criteria and set LIKE
      // inside the value instead of outside it.
      if (key === 'like') {
        _.each(val, function normalizeLike(attrVal, attrKey) {
          val[attrKey] = {};
          val[attrKey].like = attrVal;
        });

        delete criteria.like;
        criteria = _.merge(criteria, val);

        return criteria;
      }

      // If this is a CONTAINS query, convert it to a LIKE query
      if (key === 'contains') {
        criteria = { like: '%' + val + '%' };
        return criteria;
      }

      // If this is an ENDSWITH query, convert it to a LIKE query
      if (key === 'endsWith') {
        criteria = { like: '%' + val };
        return criteria;
      }

      // If this is an STARTSWITH query, convert it to a LIKE query
      if (key === 'startsWith') {
        criteria = { like: val + '%' };
        return criteria;
      }

      // Check for a NOT clause by grabbing the keys and checking for a NOT
      // value. If a NOT is used, no other modifiers may be used here.
      if (_.isPlainObject(val)) {
        var notModifier = _.includes(_.keys(val), 'not') || _.includes(_.keys(val), '!');
        if (notModifier && _.keys(val).length > 1) {
          var notError = new Error('When using a NOT modifier it may not be used with other modifiers on an attribute in the same clause.');
          notError.code = 'invalidCriteria';
          throw new Error(notError);
        }

        // If a NOT modifier is used, pull it up
        if (notModifier) {
          delete criteria[key];

          // Normalize legacy modifier
          if (val['!']) {
            val.not = val['!'];
            delete val['!'];
          }

          criteria.not = {};

          // Check if this is a NOT IN query
          if (_.isArray(val.not)) {
            var notVal = {};
            notVal.in = val.not;

            // Reset the value
            val.not = notVal;
          }

          // Set the criteria value
          criteria.not[key] = val.not;
          return;
        }
      }

      // Recurse through the criteria
      if (_.isPlainObject(val)) {
        criteria[key] = processCriteria(val);
        return;
      }

      // Handle OR criteria
      if ((key === 'or' || key === 'and') && _.isArray(val)) {
        _.each(val, function processOrClause(clause) {
          processCriteria(clause);
        });

        return criteria;
      }

      // Handle generic IN condition
      if (key !== 'or' && key !== 'and' && _.isArray(val)) {
        criteria[key] = {
          in: val
        };
      }

      // Handle normalizing spelled out operators
      if (key === 'greaterThan') {
        criteria['>'] = val;
        delete criteria[key];
      }

      if (key === 'lessThan') {
        criteria['<'] = val;
        delete criteria[key];
      }

      if (key === 'greaterThanOrEqual') {
        criteria['>='] = val;
        delete criteria[key];
      }

      if (key === 'lessThanOrEqual') {
        criteria['<='] = val;
        delete criteria[key];
      }

      return criteria;
    });

    return criteria;
  };

  //  ╔╗ ╦ ╦╦╦  ╔╦╗  ╔═╗ ╦ ╦╔═╗╦═╗╦ ╦
  //  ╠╩╗║ ║║║   ║║  ║═╬╗║ ║║╣ ╠╦╝╚╦╝
  //  ╚═╝╚═╝╩╩═╝═╩╝  ╚═╝╚╚═╝╚═╝╩╚═ ╩
  //
  var buildQuery = function buildQuery() {
    // If there was any criteria, process it
    var _criteria = criteria || {};
    if (_criteria.where) {
      _criteria.where = processCriteria(_criteria.where);
    }

    // Process any additional modifiers. These include aggregations and anything
    // outside of the 'WHERE' clause.
    if (_criteria.average) {
      processAverage(_criteria.average);
    }

    if (_criteria.max) {
      processMax(_criteria.max);
    }

    if (_criteria.min) {
      processMin(_criteria.min);
    }

    if (_criteria.sum) {
      processSum(_criteria.sum);
    }


    switch (method) {
      case 'create':
        processCreate();
        break;

      case 'find':
      case 'findOne':
        processFind(_criteria);
        break;

      case 'destroy':
        processDestroy(_criteria);
        break;

      case 'update':
        processUpdate(_criteria);
        break;

      case 'count':
        processCount(_criteria);
        break;
    }
  };

  // Build the query
  buildQuery();

  // Return the result
  return query;
};