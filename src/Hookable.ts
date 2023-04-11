import { createHookable } from './functions'
import { HookContainer } from './types'

export const Hooks = Symbol('Hooks')
export const NotHookable = Symbol('NotHookable')

export class Hookable {
	static [Hooks]?: HookContainer
	static [NotHookable]?: any[]

	constructor() {
		return createHookable(this, new.target)
	}
}
