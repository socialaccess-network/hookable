import { isSymbol, isFunction, ClassType } from '@sa-net/utils'
import { Hook } from './Hook'
import { HookableClass, Hookable, HookableSymbol } from './Hookable'
import { HookTypeMap, HookableMap } from './types'

export const hookables: HookableMap = new Map<HookableClass<any>, any>()

export function getHookMap(target: HookableClass<any>) {
	if (!hookables.has(target)) hookables.set(target, new Map())
	return hookables.get(target) as HookTypeMap
}

export function hookable<Target extends Hookable>(
	target: Target,
	hook: Hook<Target>
) {
	const proxied: Target = new Proxy(target, {
		get(target, key: any, receiver) {
			let value = Reflect.get(target, key, receiver)
			if (isSymbol(key)) return value

			value = hook.trigger(proxied, key, value, 'get')
			if (isFunction(value)) {
				value = hook.trigger(proxied, key, value, 'method')
				value = hook.trigger(proxied, key, value, 'params')
				value = hook.trigger(proxied, key, value, 'result')
			}

			return value
		},
		set(target, key: any, value, receiver) {
			value = hook.trigger(proxied, key, value, 'set')
			return Reflect.set(target, key, value, receiver)
		},
	})

	return proxied
}

export function HookableMixin<T extends ClassType>(
	target: T,
	hooks = hookables
) {
	return class extends target {
		static hookables = hooks;

		[HookableSymbol] = true as const

		constructor(...args: any[]) {
			super(...args)
			const hook = new Hook(new.target, getHookMap(new.target))
			return hookable(this, hook)
		}
	}
}
