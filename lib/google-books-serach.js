const axios = require('axios')

const API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

const fields = {
  title: 'intitle:',
  author: 'inauthor:',
  publisher: 'inpublisher:',
  subject: 'subject:',
  isbn: 'isbn:'
}

const googleBooksSearch = (query, options) => {
  if (options.field) {
    query = fields[options.field] + query
  }

  const params = {
    q: query,
    maxResults: options.limit,
    printType: options.type,
    orderBy: options.order,
  }

  return new Promise((resolve, reject) => {
    axios.get(API_BASE_URL, {params})
      .then((response) => {
        const items = response.data.items.map((item) => {
          const title = item.volumeInfo.title
          const authors = item.volumeInfo.authors || []
          const publisher = item.volumeInfo.publisher || ''
          const link = item.volumeInfo.previewLink
          const imageLink = item.volumeInfo.imageLinks === undefined ?
                              '' : item.volumeInfo.imageLinks.thumbnail
          let isbn_10 = ''
          let isbn_13 = ''

          item.volumeInfo.industryIdentifiers.map((industryIdentifier) => {
            switch (industryIdentifier.type) {
              case 'ISBN_10':
                isbn_10 = industryIdentifier.identifier
                break
              case 'ISBN_13':
                isbn_13 = industryIdentifier.identifier
                break
            }
          })

          return {
            title,
            authors,
            isbn_10,
            isbn_13,
            publisher,
            link,
            imageLink
          }
        })

        resolve(items)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

module.exports = googleBooksSearch