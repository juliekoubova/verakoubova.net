import { parseBlock, Block } from "./block-model"

function addRange<T>(target: { add(value: T): void }, values: Iterable<T>) {
  for (const v of values) {
    target.add(v)
  }
}

function getTokens(str: string | undefined) {
  return str
    ? str.split(/\s+/).filter(s => s.length !== 0)
    : []
}

export function parseBlockList(element: CheerioElement): Block {
  const parent = element.parent
    ? parseBlockList(element.parent)
    : undefined
  return parseBlock(parent, getTokens(element.attribs['class']))
}

export function getLogicalWidths($img: Cheerio) {

  const blocks = parseBlockList($img[0])

}