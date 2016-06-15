function declarationStingQuotes (stylelint, value) {
  switch (stylelint['string-quotes']) {
    case 'single':
      return value.replace(/"/g, '\'')
    default:
      return value.replace(/'/g, '\"')
  }
}


module.exports = declarationStingQuotes
