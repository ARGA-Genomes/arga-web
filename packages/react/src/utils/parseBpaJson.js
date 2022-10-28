export default function cleanupJsonAndParse(jsonString) {
  const tagsJson = jsonString
    .replace(/\s+None,/g, "'None',") // fix unquoted value in BPA data
    .replace(/'/g, '"') // single to double quotes
    .replace(/\b(True|False)\b/g, (m, v) => v.toLowerCase()) // fix capital case boolean values
  try {
    const tagObj = JSON.parse(tagsJson)
    return tagObj
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error parsing JSON:', tagsJson)
  }
  return ''
}
