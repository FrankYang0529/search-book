#!/usr/bin/env node

const program = require('commander')
const Table = require('tty-table')

const searchBook = require('..')

program
  .version(require('../package.json').version, '-v --version')
  .usage('<name> [options]')
  .option(
    '-p, --platform <platform>',
    'Searching book from Google or Book.',
    /^(Google|Book)$/i,
    'Book')
  .option('-l --limit <limit>', 'Maximum number of books to return', /^\d+$/, 10)
  .option('-i --isbn <isbn>', 'ISBN of the book.')
  .parse(process.argv)

if (program.isbn === undefined && program.args.length === 0) {
  console.log('Please input a name of book.')
}

const options = {
  field: program.isbn ? 'isbn' : 'title', // Search in a specified field
  limit: parseInt(program.limit, 10) // coercion string to number
}

const header = [
  {
    alias: '書名',
    value: 'title',
    align: 'left',
    width: 30
  },
  {
    alias: '作者',
    value: 'authors',
    align: 'left',
    width: 30
  },
  {
    alias: '出版社',
    value: 'publisher',
    align: 'left',
    width: 30
  }
]

searchBook(program.platform, program.args.join(' '), options)
  .then((result) => {
    result.map((book) => {
      const { title, authors, publisher } = book
      return {
        title,
        authors: authors.join(', '),
        publisher
      }
    })
    const table = Table(header, result)
    console.log(table.render())
  })
  .catch((error) => {
    console.log(error.toString())
  })
