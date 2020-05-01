#!/usr/bin/env node
//@ts-check

process.stdin.setEncoding('utf8')

const chunks = []

process.stdin.on('readable', () => {
  let chunk
  while ((chunk = process.stdin.read()) !== null) {
    chunks.push(chunk)
  }
});

process.stdin.on('end', () => {
  const lines = chunks.join('').split(/[\r\n]/).filter(Boolean)
  for (const line of lines) {
    const chunks = line.split(/\t/, 2)
    process.stdout.write(`- cs: ${chunks[0]}\n  de: ${chunks[1]}\n  src: .jpg\n\n`)
  }
})
