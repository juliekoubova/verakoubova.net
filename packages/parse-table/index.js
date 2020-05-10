#!/usr/bin/env node
//@ts-check
const levenshtein = require('js-levenshtein')
const { join, resolve, basename } = require('path')
const { readdirSync, renameSync, createWriteStream } = require('fs')

/**
 * @param {string} str
 */
function normalize(str) {
  return str.normalize('NFD').toLowerCase().replace(/[^a-z]|\..*/g, '')
}

const webRoot = resolve(__dirname, '../web')
const imgRoot = process.argv[2]
const root = join(webRoot, imgRoot)

for (const f of readdirSync(root)) {
  const fullPath = join(root, f)
  if (/\.jpg$/.test(f)) {
    renameSync(fullPath, join(root, f.replace(/\.jpg$/, '.jpeg')))
  } else if (/-(cz|de)\./.test(f)) {
    renameSync(fullPath, join(root, f.replace(/-cz\./, '.cs.').replace(/-de\./, '.de.')))
  }
}

const filenames = readdirSync(root).map(
  filename => ({ filename, normalized: normalize(filename.replace(/\..+$/, '')) })
)

function find(str) {
  return filenames
    .map(arg => ({ ...arg, score: levenshtein(str, arg.normalized) }))
    .sort((a, b) => a.score - b.score)
}

process.stdin.setEncoding('utf8')

const chunks = []

process.stdin.on('readable', () => {
  let chunk
  while ((chunk = process.stdin.read()) !== null) {
    chunks.push(chunk)
  }
});

process.stdin.on('end', () => {
  const outfile = createWriteStream(
    join(webRoot, '_data/galleries', basename(imgRoot) + '.yaml'),
    { encoding: 'utf8' }
  )

  outfile.write(`cs: \nde: \npageId: ${imgRoot.replace(/.*img\//, '')}\nimageBase: ${imgRoot}\nimages:\n\n`)

  const lines = chunks.join('').split(/[\r\n]/).filter(Boolean)
  for (const line of lines) {
    const [cs, de] = line.split(/\t/, 2)

    const csNorm = normalize(cs)
    const deNorm = normalize(de)
    const csBest = find(csNorm)[0]
    const deBest = find(deNorm)[0]
    const best = csBest.score <= deBest.score ? csBest : deBest

    outfile.write(`- cs: ${cs}\n  de: ${de}\n  src: ${best.filename}\n\n`)
  }
  outfile.close()
})
