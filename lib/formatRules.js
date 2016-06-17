var formatSelectors = require('./formatSelectors')
var formatDecls = require('./formatDecls')
var getIndent = require('./getIndent')
var hasDecls = require('./hasDecls')
var hasRules = require('./hasRules')

function formatRules (root, params) {
  var stylelint = params.stylelint
  var indentWidth = params.indentWidth
  var ruleBuffer

  root.walkRules(function (rule, index) {
    ruleBuffer = rule
    var ruleBefore
    var parentType = rule.parent.type
    var indentation = getIndent(rule, indentWidth)

    var hasComment = false
    var prev = rule.prev()
    if (prev && prev.type === 'comment') {
      hasComment = true
    }

    if (index === 0 && parentType === 'root') {
      ruleBefore = '';
    } else {

      if (parentType === 'atrule') {
        if (rule.parent.first === rule) {
          ruleBefore = '\n' + indentation
        } else {
          ruleBefore = '\n\n' + indentation
        }
      }
      if (parentType === 'rule') {
        if (rule.parent.first === rule) {
          ruleBefore = '\n\n' + indentation // changed to double space for nested elements @FIX !NEEDS TESTING
        } else {
          ruleBefore = '\n\n' + indentation
        }
      }

      if (parentType === 'root') {
        ruleBefore = '\n\n' + indentation
      }

      if (hasComment) {
        ruleBefore = '\n' + indentation
      }
    }

    var isSingleLine
    if (index > 0) {
      isSingleLine = !/\n/.test(ruleBuffer.toString())
    } else {
      isSingleLine = !/\n/.test(rule.toString())
    }
    setRuleRawsConfig(rule, {
      ruleBefore: ruleBefore,
      indentation: indentation,
      stylelint: stylelint,
      isSingleLine: isSingleLine
    })

    rule = formatSelectors(rule, indentation, stylelint)
    rule = formatDecls.formatDecls(rule, indentation, indentWidth, stylelint)

    rule.walkAtRules(function (rule) {
      var indentation = getIndent(rule, indentWidth)
      formatDecls.formatDecls(rule, indentation, indentWidth)
    })

    if (hasRules(rule) && !rule.ruleWithoutBody) rule.raws.after = '\n\n' + indentation // to be made to fit in with lint settings @FIX

   	if (rule.ruleWithoutBody) {
   		rule.raws.between = ';'
   		rule.raws.after = ''
   		if(rule.prev() && rule.prev().type == 'decl') rule.raws.before = '\n' + indentation
   	}

    if (rule.nodes) {
    	if (!rule.nodes.length) rule.raws.after = '\n\n' + indentation
		if (rule.nodes.length) {
    		var last = rule.nodes[rule.nodes.length-1]
    		if (last) {
    			if (last.type === 'decl') rule.raws.after = '\n' + indentation
    			if (last.params && last.nodes) if (!last.nodes.length) rule.raws.after = '\n' + indentation
    			if (last.params && !last.nodes) rule.raws.after = '\n' + indentation
    		}
    	}
    }

    if (rule.prev()) if (rule.prev().type == 'comment' && !rule.prev().inline) rule.raws.before = '\n\n' + indentation
    if (rule.prev()) if (rule.prev().type == 'comment' && parentType === 'root') rule.raws.before = '\n\n' + indentation

    if (rule.ruleWithoutBody && parentType != 'root') rule.raws.before = '\n' + indentation

    if (rule.params) {
	    if (!rule.nodes) {
	    	rule.raws.after = ''
		    if (rule.prev()) if(rule.prev().params) rule.raws.before = '\n' + indentation
		   	if (parentType != 'root') rule.raws.before = '\n' + indentation
		} else {
			if (!rule.nodes.length) rule.raws.after = '\n\t' + indentation + '/* Insert Comment */\n'
		}
	}

  })

  return root
}

function setRuleRawsConfig (rule, opts) {
  rule.raws.before = opts.ruleBefore
  rule.raws.afterName = ' '
  setPropertyForAtRuleSemicolonNewlineAfter(rule.raws, opts)
  if (opts.stylelint['block-closing-brace-newline-after']) {
    setPropertyForBlockClosingBraceNewlineAfter(rule.raws, opts)
  } else {
    setPropertyForAtRuleSemicolonNewlineAfter(rule.raws, opts)
  }
  if (opts.stylelint['block-opening-brace-newline-before']) {
    rule.raws.between = blockOpeningBraceNewlineBefore(rule, opts)
  } else {
    rule.raws.between = blockOpeningBraceSpaceBefore(rule, opts)
  }
}

function setPropertyForAtRuleSemicolonNewlineAfter (raws, opts) {
  switch (opts.stylelint['at-rule-semicolon-newline-after']) {
    default:
      raws.after = '\n' + opts.indentation
      raws.semicolon = true
      break
  }
}

function setPropertyForBlockClosingBraceNewlineAfter (raws, opts) {
  raws.semicolon = true
  switch (opts.stylelint['block-closing-brace-newline-after']) {
    case 'never-multi-line':
      raws.before = ''
      break
    default:
      raws.before = opts.ruleBefore
      break
  }

}

function blockOpeningBraceSpaceBefore (rule, opts) {
  if (isIgnoreRule(opts.stylelint, rule)) {
    return rule.raws.between
  }
  if (rule.params === '()') {
  	return ''
  }
  switch (opts.stylelint['block-opening-brace-space-before']) {
    case 'never':
      return ''
    case 'always-single-line':
      if (!opts.isSingleLine) {
        return rule.raws.between
      }
      return ' '
    case 'never-single-line':
      if (!opts.isSingleLine) {
        return rule.raws.between
      }
      return ''
    case 'always-multi-line':
      if (opts.isSingleLine || rule.raws.between.match(/ {/)) {
        return rule.raws.between
      }
      return ' '
    case 'never-multi-line':
      if (opts.isSingleLine) {
        return rule.raws.between
      }
      return ''
    default:
      return ' '
  }
}

function blockOpeningBraceNewlineBefore (rule, opts) {
  if (isIgnoreRule(opts.stylelint, rule)) {
    return rule.raws.between
  }
  switch (opts.stylelint['block-opening-brace-newline-before']) {
    case 'always':
      return '\n' + opts.indentation
    case 'always-single-line':
      if (opts.isSingleLine) {
        return rule.raws.between
      }
      return '\n'
    case 'never-single-line':
      if (opts.isSingleLine) {
        return ''
      }
      return rule.raws.between
    case 'always-multi-line':
      if (opts.isSingleLine) {
        return rule.raws.between
      }
      return ' '
    case 'never-multi-line':
      if (opts.isSingleLine) {
        return rule.raws.between
      }
      return ''
    default:
      return rule.raws.between
  }
}

function isIgnoreRule (stylelint, css) {
  if (!stylelint.ignoreAtRules) {
    return false
  }
  return stylelint.ignoreAtRules.some(function (ignoreRule) {
    return css.match(new RegExp(ignoreRules, 'g'))
  })
}

module.exports = formatRules
