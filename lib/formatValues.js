var formatTransforms = require('./formatTransforms')
var formatColors = require('./formatColors')
var namedColors = require('./namedColors')
var getIndent = require('./getIndent')

var lengthUnits = [
  // Relative length units
  "em",
  "ex",
  "ch",
  "rem",
  // Viewport-percentage lengths
  "vh",
  "vw",
  "vmin",
  "vmax",
  "vm",
  // Absolute length units
  "px",
  "mm",
  "cm",
  "in",
  "pt",
  "pc",
  "q",
]

function formatvalues (decl, stylelint) {
  var isDataUrl = /data:.+\/(.+);base64,(.*)/.test(decl.value)
  var isVarNotation = /var\s*\(.*\)/.test(decl.value)
  var isString = /^("|').+("|')$/.test(decl.value)
  var isFunctionCall = /\w+\(.+\)/.test(decl.value)

  if (decl.raws.value) {
    decl.raws.value.raw = decl.raws.value.raw.trim()
  }

  if (!isString) {
    decl.value = decl.value.trim().replace(/\s+/g, ' ')
  }

  if (decl.prop === 'content') {
    return decl
  }

  if (decl.prop === 'font-family') {
    decl.value = decl.value.trim().replace(/\s+,\s/g, ', ')
    return decl
  }

  if (!isDataUrl) {
    // Remove spaces before commas and keep only one space after.
    decl.value = decl.value.trim().replace(/(\s+)?,(\s)*/g, ', ')
  }

  if (isVarNotation) {
    decl.value = decl.value.replace(/var\s*\(\s*/g, 'var(')
    decl.value = decl.value.replace(/\s*\)/g, ')')
  }

  if (!isFunctionCall) {
    // format math operators before `$` or `(`.
    decl.value = decl.value.replace(/(?!^)[+\-*%](?=\$|\()/g, ' $& ')
    // don't format "/" from a "font" shorthand property.
    if (decl.prop !== 'font') {
      decl.value = decl.value.replace(/\/(?=\$|\(|\d)/g, ' $& ')
    }
    // format "-" if it is between numbers
    decl.value = decl.value.replace(/\d+-(?=\d)/g, function(value) {
      return value.replace(/-/g, ' $& ')
    })
  }

  if(stylelint && stylelint['number-no-trailing-zeros']) {
  	var valArr = decl.value.split(' ');

  	for (var i = valArr.length - 1; i >= 0; i--) {
  		if(Number.isInteger(parseInt(valArr[i]))) {
  			var unit = valArr[i].match(/[^-\d\.]/g, '')
		  	var val = valArr[i].replace(/[^-\d\.]/g, '')
			val = parseFloat(val).toString()
			if(unit) unit = unit.join('')
			if(($.inArray(unit, lengthUnits) == -1 || val != 0) && unit) val = val + unit // need to work with lint length-zero-no-unit
			valArr.splice(i, 1, val);
  		}
  	}

  	decl.value = valArr.join(' ');

  }

  decl.value = decl.value.replace(/\(\s*/g, '(')
  decl.value = decl.value.replace(/\s*\)/g, ')')
  decl.value = namedColors(decl, stylelint)
  decl.value = formatColors(decl.value, stylelint)
  decl.value = formatTransforms(decl.value)

  // format font face returns
  if (decl.parent.name === 'font-face' && decl.value.match(',', 'g')) {
  	var declArr = decl.value.split(',')
  	decl.value = declArr.join(',\n\t\t').replace(/ /g, '').replace(/\)f/g, ') f')
  }

  if (decl.important) {
    decl.raws.important = " !important"
  }

  // make sure - symbol has no space when used for background images
  decl.value = decl.value.replace(/(- \()+/g, '-(')

  return decl
}


module.exports = formatvalues
