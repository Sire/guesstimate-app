const DIGIT_REGEX = /^\d+$/
const readableIdPartFromWord = word => DIGIT_REGEX.test(word) ? word : word[0]

function prepareName(rawName) {
  const name = rawName.trim().toLowerCase().replace(/[^\w\d]/g, ' ')
  const firstNonDigit = name.search(/[^\d\s]/)
  if (firstNonDigit === -1) { return '' }
  return name.slice(firstNonDigit).trim().replace(/\s/g, '_')
}

function getDirectVariableNameFromName(rawName, maxOneWordLength, maxSplitWordLength, cutOffLength) {
  const name = prepareName(rawName)

  const words = name.split(/[\_]/).filter(s => !_.isEmpty(s))

  if (words.length === 1 && name.length < maxOneWordLength) {
    return name
  } else if (words.length < maxSplitWordLength) {
    return name.slice(0, cutOffLength)
  } else {
    return words.map(readableIdPartFromWord).slice(0, cutOffLength).join('')
  }
}

export function getVariableNameFromName(
  rawName,
  existingVariableNames=[],
  maxOneWordLength=30,
  maxSplitWordLength=8,
  totalMaxLength=maxSplitWordLength,
  allowUnderscores=true,
) {
  let directName = getDirectVariableNameFromName(rawName, maxOneWordLength, maxSplitWordLength, totalMaxLength)
  if (!allowUnderscores) { directName = directName.replace(/\_/g, '') }

  const nameRegex = new RegExp(`${directName}(\\d+)?`, 'i')

  const matchingNames = existingVariableNames.filter(v => nameRegex.test(v))
  if (_.isEmpty(matchingNames)) { return directName }

  const currentMaxSuffix = Math.max(...matchingNames.map(v => parseInt(v.match(nameRegex)[1] || '0')))
  return `${directName}${currentMaxSuffix + 1}`
}

export const shouldTransformName = name => !(_.isEmpty(name) || _.isEmpty(name.replace(/[^a-zA-Z]/g, '').trim()))
