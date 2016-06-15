var util = require('./util')

function declarationStingQuotes (stylelint, value) {
  var quotes = util.isArrayObject(stylelint['string-quotes']);
  switch (quotes) {
    case 'single':
      return value.replace(/"/g, '\'')
    default:
      return value.replace(/'/g, '\"')
  }
}


module.exports = declarationStingQuotes
