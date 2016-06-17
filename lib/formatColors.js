var cssColors = require('css-color-list')
var util = require('./util')
var namedColors = require('./namedColorData.js')
var namedColorsRegex = new RegExp('(^|\s+)(' + cssColors().join('|') + ')(?=\$|\s+)', 'ig')
var hslRegex = /hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*[\d\.]+)?\s*\)/ig
var hexRegex = /#[a-f0-9]{3}([a-f0-9]{3})?/ig
var rgbRegex = /rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d\.]+)?\s*\)/ig

function toLowerCase (value) {
  return value.toLowerCase()
}

function toUpperCase (value) {
  return value.toUpperCase()
}

function colorsToLowerCase (value) {
  return value.replace(namedColorsRegex, toLowerCase)
              .replace(hslRegex, toLowerCase)
              .replace(hexRegex, toLowerCase)
              .replace(rgbRegex, toLowerCase)
}

function formatColors (value, stylelint) {
  var colorCase
  if (stylelint && stylelint['color-hex-case']) {
    colorCase = util.isArrayObject(stylelint['color-hex-case'])
  }

  if(value.match(hexRegex)) if(canShrink(value)) value = shorter(value)

  var formatCase = toLowerCase
  if (colorCase === 'upper') {
    formatCase = toUpperCase
  }

  return value.replace(namedColorsRegex, formatCase)
              .replace(hslRegex, formatCase)
              .replace(hexRegex, formatCase)
              .replace(rgbRegex, formatCase)
}

function canShrink(hex) {
  hex = hex.toLowerCase()

  return (
    hex[1] === hex[2]
    && hex[3] === hex[4]
    && hex[5] === hex[6]
    && (hex.length === 7 || (hex.length === 9 && hex[7] === hex[8])))
}

function shorter(hex) {
  var hexVariant = "#"
  for (var i = 1; i < hex.length; i = i + 2) {
    hexVariant += hex[i]
  }
  return hexVariant
}

module.exports = formatColors
