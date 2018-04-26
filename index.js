const _ = require('lodash')

const googleBooksSearch = require('./lib/google-books-search')
const booksSearch = require('./lib/books-search')

const defaultOptions = {
  // Search in a specified field
  field: 'title',
  // The position in the collection at which to start the list of results
  offset: 1,
  // The maximum number of elements to return with this request (Max 40)
  limit: 10,
  // Restrict results to books or magazines (or both)
  type: 'all',
  // Order results by relevance or newest
  order: 'relevance',
};

const searchBook = async (platform, query, options) => {
  if (!query) {
    throw new Error('Please input query.')
  }

  const userOptions = _.extend({}, defaultOptions, options)

  if (!Number.isInteger(userOptions.offset) || userOptions.offset < 1) {
    throw new Error('Offset must be greater than 0.')
  }

  if (!Number.isInteger(userOptions.limit) || userOptions.limit < 1 || userOptions > 40) {
    throw new Error('Limit must be positive integer between 1 and 40.')
  }

  let parseFunc = null

  switch (platform.toLowerCase()) {
    case 'google':
      parseFunc = googleBooksSearch
      userOptions.offset -= 1 // Google search from startIndex 0
      break
    case 'book':
      parseFunc = booksSearch
      break
  }

  if (!parseFunc) {
    throw new Error('Please input correct platform name google or book.')
  }

  return await parseFunc(query, userOptions)
}

module.exports = searchBook