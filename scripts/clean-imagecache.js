#!/usr/bin/env node
// @ts-check
const { promises: { readdir, stat, unlink } } = require('fs')
const { join } = require('path')

/**
 * @param {string} root
 */
async function* walk(root) {
  const pending = [root]
  let current

  while (current = pending.pop()) {
    const entries = await readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const path = join(current, entry.name)
      if (entry.isDirectory()) {
        pending.push(path)
      } else {
        const stats = await stat(path)
        yield { path, entry, stats }
      }
    }
  }
}

async function main() {
  const root = join(__dirname, '../.imagecache')
  for await (const { path, stats } of walk(root)) {
    if (stats.nlink < 2) {
      console.log(`${path}: nlink=${stats.nlink}, deleting...`)
      await unlink(path)
    }
  }
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err)
    process.exit(1)
  }
)