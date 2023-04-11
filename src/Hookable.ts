import { createHookable } from './functions'

export const NotHookable = Symbol('NotHookable')

export class Hookable {
	static [NotHookable]?: any[]

	constructor() {
		return createHookable(this, new.target)
	}
}
