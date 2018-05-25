const axios = require('axios')
const cheerio = require('cheerio')

const API_BASE_URL = 'http://search.books.com.tw/search/query/cat/1/key'

const booksSearch = async (query, options) => {
  const encodedQuery = encodeURIComponent(query)
  const queryURL = `${API_BASE_URL}/${encodedQuery}/sort/1/page/${options.offset}`

  try {
    const response = await axios.get(queryURL)
    const $ = cheerio.load(response.data)

    const parseBook = $('li.item').map(async function (i, itemElem) {
      const $item = $(itemElem)

      const title = $item.find('a[rel="mid_name"]').text().trim()
      const authors = $item.find('a[rel="go_author"]').map(function (j, authorElem) {
        return $(authorElem).text().trim()
      }).get()

      const publisher = $item.find('a[rel="mid_publish"]').text().trim()
      let link = $item.find('a[rel="mid_image"]').attr('href')
      link = (link.indexOf('http:') !== -1) ? link : `http:${link}`
      const imageLink = $item.find('img.itemcov').data('original')
      const { isbn10, isbn13 } = await parseISBN(link)

      return {
        title,
        authors,
        publisher,
        link,
        imageLink,
        isbn10,
        isbn13
      }
    }).get()

    const items = await Promise.all(parseBook)
    return items
  } catch (error) {
    return error.message
  }
}

const parseISBN = async (url) => {
  const response = await axios.get(url)
  const $ = cheerio.load(response.data)
  let isbnContent = $('meta[itemprop="productID"]').attr('content') || ''
  let isbn10 = ''
  let isbn13 = ''

  isbnContent = isbnContent.split(':').length === 2 ? isbnContent.split(':')[1] : ''
  if (isbnContent.length === 10) {
    isbn10 = isbnContent
  } else if (isbnContent.length === 13) {
    isbn13 = isbnContent
  }

  return { isbn10, isbn13 }
}

module.exports = booksSearch
