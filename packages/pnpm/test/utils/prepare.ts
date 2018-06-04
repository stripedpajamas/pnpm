import assertProject from '@pnpm/assert-project'
import mkdirp = require('mkdirp')
import path = require('path')
import {Test} from 'tape'
import tempy = require('tempy')
import writePkg = require('write-pkg')
import os = require('os')
import uniqueString = require('unique-string')

export function tempDir (t: Test) {
  const tmpDir = path.join(process.env['APPVEYOR'] ? path.dirname(os.tmpdir()) : os.tmpdir(), uniqueString())
  mkdirp.sync(tmpDir)

  t.pass(`create testing dir ${tmpDir}`)

  process.chdir(tmpDir)

  return tmpDir
}

export default function prepare (t: Test, pkg?: Object | Object[], pkgTmpPath?: string): any {
  pkgTmpPath = pkgTmpPath || path.join(tempDir(t), '_')

  if (Array.isArray(pkg)) {
    const dirname = path.dirname(pkgTmpPath)
    const result = {}
    for (let aPkg of pkg) {
      if (typeof aPkg['location'] === 'string') {
        result[aPkg['package']['name']] = prepare(t, aPkg['package'], path.join(dirname, aPkg['location']))
      } else {
        result[aPkg['name']] = prepare(t, aPkg, path.join(dirname, aPkg['name']))
      }
    }
    process.chdir('..')
    return result
  }
  mkdirp.sync(pkgTmpPath)
  writePkg.sync(pkgTmpPath, Object.assign({name: 'project', version: '0.0.0'}, pkg))
  process.chdir(pkgTmpPath)

  return assertProject(t, pkgTmpPath)
}
