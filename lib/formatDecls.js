var getIndent = require('./getIndent')
var formatValues = require('./formatValues')
var hasDecls = require('./hasDecls')
var declarationStingQuotes = require('./stringQuotes')
var util = require('./util')

function formatDecls (rule, indent, indentWidth, stylelint) {

  if (hasDecls(rule)) {
    rule.walkDecls(function (decl) {
      var isCustomProp = /^--/.test(decl.prop)
      var isSassVal = /^\$/.test(decl.prop)
      var isIEHack = (/(\*|_)$/).test(decl.raws.before)

      if (decl.prop && !isCustomProp && !isSassVal) {
        decl.prop = decl.prop.toLowerCase()
      }

      if (isIEHack) {
        decl.prop = decl.raws.before.trim().replace(/\n/g, '') + decl.prop
      }

      decl.raws.before = '\n' + indent + indentWidth
      decl.raws.between = ': '

      if (stylelint && stylelint['string-quotes']) {
        decl.value = declarationStingQuotes(stylelint, decl.value)
      }

      if (stylelint && stylelint['declaration-colon-space-before']) {
        decl.raws.between = declarationColonSpaceBefore(stylelint, decl.raws.between)
      }

      if (stylelint && stylelint['declaration-colon-space-after']) {
        decl.raws.between = declarationColonSpaceAfter(stylelint, decl.raws.between)
      }

      if (decl.prev()) if(decl.prev().type === 'rule' && !decl.prev().params && !decl.prev().ruleWithoutBody) decl.raws.before = '\n\n' + indent + indentWidth

      formatValues(decl, stylelint)
    })
  }

  return rule
}

function formatDeclsSingle (root, params) {
	var stylelint = params.stylelint;

	root.walkDecls(function (decl) {

		if(decl.parent.type === 'root') {

			if (stylelint && stylelint['declaration-colon-space-before']) decl.raws.between = declarationColonSpaceBefore(stylelint, decl.raws.between)
			if (stylelint && stylelint['declaration-colon-space-after']) decl.raws.between = declarationColonSpaceAfter(stylelint, decl.raws.between)
			if (decl.prop.match('@')) {
				decl.raws.between = ' ' + decl.raws.between
				decl.raws.before = '\n' + decl.raws.before.trim()
			}

		}

	})

	return root
}

function declarationColonSpaceBefore (stylelint, between) {
  var rule = util.isArrayObject(stylelint['declaration-colon-space-before'])
  switch (rule) {
    case 'always':
      return ' ' + between
    default:
      return between
  }
}

function declarationColonSpaceAfter (stylelint, between) {
  var rule = util.isArrayObject(stylelint['declaration-colon-space-after'])
  switch (rule) {
    case 'never':
      return between.trim()
    default:
      return between
  }
}

module.exports = {
	formatDecls: formatDecls,
	formatDeclsSingle: formatDeclsSingle
}
