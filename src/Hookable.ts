import { createHookable } from './functions'
import { HookContainer } from './types'

export const Hooks = Symbol('Hooks')
export const NotHookable = Symbol('NotHookable')

export class Hookable {
	static [Hooks]?: HookContainer
	static [NotHookable]?: any[]

	constructor() {
		if (new.target === Hookable)
			throw new Error('do not instantiate the Hookable class by itself')

		return createHookable(this, new.target, new.target[Hooks])
	}
}
