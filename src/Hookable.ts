import { createHookable } from './functions'

export class Hookable {
	constructor() {
		return createHookable(this, new.target)
	}
}
