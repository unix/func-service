import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import * as print from '../utils/print'
import * as spiner from '../utils/spinner'
import { Command, SubOptions, CommandArgsProvider } from 'func'

const cwd = process.cwd()

@Command({
  name: 'build',
  description: 'pack all files',
})
@SubOptions([{
  name: 'file', alias: 'f', type: String,
}, {
  name: 'out', alias: 'o', type: String,
}])
export class Build {
  private pkgPath: string = path.join(cwd, 'package.json')
  private indexs: string[] = [
    path.join(cwd, 'src', 'index.ts'),
    path.join(cwd, 'index.ts'),
  ]
  
  private entry: string
  private output: string = path.join(cwd, 'dist')
  
  constructor(
    private args: CommandArgsProvider,
  ) {
    this.check()
      .then(() => this.compile())
      .catch(print.catchErr)
  }
  
  async check(): Promise<void> {
    spiner.start('validating...')
    if (!fs.existsSync(this.pkgPath)) {
      throw new Error(`About. Not found ${this.pkgPath}.`)
    }

    this.entry = this.args.option.file
      ? path.join(cwd, this.args.option.file)
      : this.indexs.find(item => fs.existsSync(item))
    if (!this.entry) throw new Error(`About. Not found entry.`)

    if (this.args.option.out) {
      this.output = path.join(cwd, this.args.option.out)
    }

    try {
      // tslint:disable-next-line:no-eval
      eval('require("ncc")')
    } catch (e) {
      const fix = print.cyanColor('npm i ncc -D')
      throw new Error(`About. missing package "ncc". \n  Run "${fix}" to fix.`)
    }
    spiner.succeed()
  }
  
  async compile(): Promise<void> {
    spiner.start('bundling...')
    const command = `cd ${cwd} && ncc -m build ${this.entry} -o ${this.output}`
    exec(command, (err, stdout) => {
      if (err) throw err
      spiner.succeed()
      console.log(stdout.toString())
      const bin = path.join(this.output, 'bin.js')
      const content = `#!/usr/bin/env node\nrequire('./index.js')`
      fs.writeFileSync(bin, content)
    })
  }
  
}
