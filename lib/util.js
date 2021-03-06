function inAtRule (rule) {
  var ret = false
  var current = rule.parent
  while (current.type !== 'root') {
    if (current.type === 'atrule') {
      ret = true
      break
    }
    current = current.parent
  }

  return ret
}

function getNestedRulesNum (rule) {
  var parent = rule.parent
  var num = 0

  while (parent.type !== 'root') {
    parent = parent.parent
    num++
  }

  return num
}

function isEmptyObject (obj) {
  for (var name in obj) {
    return false
  }
  return true
}

function isArrayObject (obj) {
  return (Array.isArray(obj)) ? obj[0] : obj
}

colorFunctionNames = new Set([
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "gray",
])

module.exports = {
  inAtRule: inAtRule,
  getNestedRulesNum: getNestedRulesNum,
  isEmptyObject: isEmptyObject,
  isArrayObject: isArrayObject,
  colorFunctionNames: colorFunctionNames
}
