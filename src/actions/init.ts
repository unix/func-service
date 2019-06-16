import { Command } from 'func'
import * as print from '../utils/print'


@Command({
  name: 'init',
  description: 'create a `func` project',
})
export class Init {
  
  constructor() {
    const initCommand = print.cyanColor('npm init func')
    const text = print.logColor(`> You can use command "${initCommand}" to create project.`)
    console.log(print.dangerColor('> Deprecated.'))
    console.log(text)
  }
  
}
