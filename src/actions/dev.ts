import fs from 'fs'
import path from 'path'
import * as print from '../utils/print'
import * as spiner from '../utils/spinner'
import { Command, CommandArgsProvider, SubOptions } from 'func'
import { exec, execSync } from 'child_process'

const cwd = process.cwd()

@Command({
  name: 'dev',
  description: 'setup link',
})
@SubOptions([
  {
    name: 'file',
    alias: 'f',
    type: String,
  },
])
export class Dev {
  private pkgPath: string = path.join(cwd, 'package.json')
  private entry: string
  private bin: string

  private indexs: string[] = [
    path.join(cwd, 'src', 'index.ts'),
    path.join(cwd, 'index.ts'),
  ]

  constructor(private args: CommandArgsProvider) {
    this.check()
      .then(() => this.dev())
      .catch(print.catchErr)
  }

  async check(): Promise<void> {
    spiner.start('validating...')
    if (!fs.existsSync(this.pkgPath)) {
      throw new Error(`About. Not found ${this.pkgPath}.`)
    }
    const pkg = JSON.parse(fs.readFileSync(this.pkgPath, 'utf-8'))
    if (!pkg.bin) {
      if (!pkg.name) throw new Error(`About. Not found item "name" in ${this.pkgPath}.`)

      pkg.bin = {
        [pkg.name]: './dist/bin.js',
      }
      fs.writeFileSync(this.pkgPath, JSON.stringify(pkg, null, 2))
    }
    this.bin = Object.keys(pkg.bin)[0]

    this.entry = this.args.option.file
      ? path.join(cwd, this.args.option.file)
      : this.indexs.find(item => fs.existsSync(item))
    if (!this.entry) throw new Error(`About. Not found entry.`)

    try {
      execSync('ts-node -v')
    } catch (e) {
      const fix = print.cyanColor('npm i -g ts-node')
      throw new Error(`About. Missing global package "ts-node". \n  Run "${fix}" to fix.`)
    }

    spiner.succeed(true)
  }

  async dev(): Promise<void> {
    const dist = path.join(cwd, 'dist')
    const devBin = path.join(cwd, 'dist', 'bin.js')
    const linkCommand = this.getLinkCommand()
    if (!fs.existsSync(dist)) fs.mkdirSync(dist)
    if (fs.existsSync(devBin)) fs.unlinkSync(devBin)

    const content = '#!/usr/bin/env ts-node \nrequire("../src/index")'
    fs.writeFileSync(devBin, content)
    spiner.start('linking file...')

    const command = `cd ${cwd} && ${linkCommand} && chmod +x ./dist/bin.js`
    exec(command, err => {
      if (err) throw err
      spiner.succeed()
      const log = print.logColor(`> done. run ${print.cyanColor(this.bin)} to start.`)
      console.log(log)
      console.log('')
    })
  }

  private getLinkCommand(): string {
    const yarnLock = path.join(cwd, 'yarn.lock')
    return fs.existsSync(yarnLock) ? '(yarn unlink; yarn link)' : 'npm link'
  }
}
