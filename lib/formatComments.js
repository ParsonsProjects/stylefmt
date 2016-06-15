var getIndent = require('./getIndent')

function formatComments (root, params) {
  var indentWidth = params.indentWidth

  root.walkComments(function (comment, index) {
    var parentType = comment.parent.type
    var isInline = comment.inline === true
    var isPrevInline = comment.prev() && comment.prev().inline
    var isPrevDecl = comment.prev() && comment.prev().type === 'decl'
    var isPrevAtRule = comment.prev() && comment.prev().type === 'atrule'
    var hasLineBreakBefore = /[\n]/.test(comment.raws.before)
    var commentBefore
    var indentation = getIndent(comment, indentWidth)

    if (index === 0 && parentType === 'root') {
      commentBefore = ''
    } else if ((isPrevDecl || isPrevAtRule) && !hasLineBreakBefore) {
      commentBefore = ' '
    } else {
      if (parentType === 'atrule') {
        if (comment.parent.first === comment) {
          commentBefore = '\n' + indentation
        } else {
          commentBefore = '\n\n' + indentation
        }
      }

      if (parentType === 'rule') {
        if (isInline && (comment.parent.first === comment || isPrevInline)) {
          commentBefore = '\n' + indentation
        } else {
          commentBefore = '\n\n' + indentation
        }
        if(comment.parent.first === comment && comment.parent.nodes.length === 1) commentBefore = '\n' + indentation
      }

      if (parentType === 'root') {
        // Handle multiline inline comments.
        if (isInline && isPrevInline) {
          commentBefore = '\n' + indentation
          if(comment.prev().text.match(/===/g)) commentBefore = '\n\n' + indentation
        } else {
          commentBefore = '\n\n' + indentation
        }
      }
    }

    comment.raws.before = commentBefore
  })

  return root
}


module.exports = formatComments
