import { ClassType } from '@sa-net/utils'
import { hookables, hookable } from './functions'
import { Hook } from './Hook'

export const HookableSymbol = Symbol('Hookable')

export abstract class Hookable {
	static hookables = hookables;

	[HookableSymbol] = true as const

	constructor(hook = new Hook(new.target as any)) {
		return hookable(this, hook)
	}
}

export type HookableClass<H extends Hookable> = ClassType<H>
