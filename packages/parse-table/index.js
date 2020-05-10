#!/usr/bin/env node
//@ts-check
const levenshtein = require('js-levenshtein')
const { join, resolve, basename } = require('path')
const { readdirSync, renameSync, createWriteStream, statSync } = require('fs')

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

const filenames = readdirSync(root).map(filename => ({
  ext: filename.replace(/[^.]+\./, ''),
  filename,
  normalized: normalize(filename.replace(/\..+$/, ''))
}))

console.log(filenames)

function find(str, ext) {
  return filenames
    .filter(f => f.ext === ext)
    .map(f => ({ ...f, score: levenshtein(str, f.normalized) }))
    .sort((a, b) => a.score - b.score)
}

function exists(name) {
  try {
    statSync(join(root, name))
    return true
  } catch (e) {
    return false
  }
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
    const csBestJpeg = find(csNorm, 'jpeg')[0]
    const deBestJpeg = find(deNorm, 'jpeg')[0]
    const best = csBestJpeg.score <= deBestJpeg.score ? csBestJpeg : deBestJpeg

    outfile.write(`- cs: ${cs}\n  de: ${de}\n`)

    if (best) {
      outfile.write(`  src: ${best.filename}\n`)
    }

    const csHtml = best.filename.replace(/\.jpeg$/, '.cs.html')
    const deHtml = best.filename.replace(/\.jpeg$/, '.de.html')
    const csHtmlExists = exists(csHtml)
    const deHtmlExists = exists(deHtml)

    if (csHtmlExists || deHtmlExists) {
      outfile.write(`  left:\n`)
      if (csHtmlExists) {
        outfile.write(`    cs: ${csHtml}\n`)
      }
      if (deHtmlExists) {
        outfile.write(`    de: ${deHtml}\n`)
      }
    }

    outfile.write('\n')
  }
  outfile.close()
})
