import chalk from 'chalk'
import * as spinner from './spinner'

export const logColor = (text: string): string => {
  return chalk.hex('#bdbdbd')(text)
}

export const cyanColor = (text: string): string => {
  return chalk.cyanBright(text)
}

export const dangerColor = (text: string): string => {
  return chalk.redBright(text)
}

export const catchErr = (err: Error): void => {
  const msg = err.message || `${err}`
  spinner.fail()
  console.log(dangerColor(`> ${msg}`))
  process.exit(1)
}



