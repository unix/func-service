import { Container } from 'func'
import * as commands from './actions'
import * as options from './options'

const modules = Object.assign({}, commands, options)
const params = Object.keys(modules).map(key => modules[key])
new Container(params)
