var util = require('./util')
var namedColorData = require('./namedColorData.js')

function convertToColor(decl, stylelint) {

	var type = decl.type
	var value = decl.value
	var namedColors = Object.keys(namedColorData)

	// Then by checking for alternative hex representations
    var namedColor
    for (var i = 0, l = namedColors.length; i < l; i++) {
      namedColor = namedColors[i]
      if(namedColor === value) {
      	return namedColorData[namedColor].hex[0]
      }
    }

    return value

}


function convertToName(decl, stylelint) {

	var type = decl.type
	var value = decl.value
	var namedColors = Object.keys(namedColorData)

	// First by checking for alternative color function representations ...
	if (type === "function" && util.colorFunctionNames.has(value.toLowerCase())) {
		  var normalizedFunctionString = valueParser.stringify(node).replace(/\s+/g, "")
	      var namedColor
	      for (var i = 0, l = namedColors.length; i < l; i++) {
	        namedColor = namedColors[i]
	        if (namedColorData[namedColor].func.indexOf(normalizedFunctionString.toLowerCase()) !== -1) {
	          return namedColor
	        }
	      }
	      return value
	}

	// Then by checking for alternative hex representations
    var namedColor
    for (var i = 0, l = namedColors.length; i < l; i++) {
      namedColor = namedColors[i]
      if (namedColorData[namedColor].hex.indexOf(value.toLowerCase()) !== -1) {
        return namedColor
      }
    }

    return value

}

function namedColor (decl, stylelint) {

  	var colorNamed = util.isArrayObject(stylelint['color-named'])

	switch (colorNamed) {
    case 'never':
      return convertToColor(decl, stylelint)
      break
   	case 'always-where-possible':
      return convertToName(decl, stylelint)
      break
    default:
      return value
      break
  	}

  return value
}

module.exports = namedColor
