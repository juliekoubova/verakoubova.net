export function isHtml(outputPath: string | boolean) {
  if (typeof outputPath !== 'string') {
    return false
  }
  return outputPath.endsWith('.html')
}