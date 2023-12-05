import { FunctionType } from '@sa-net/utils'
import { Hookable, HookableClass } from './Hookable'
import {
	HookListener,
	HookMap,
	HookLevelMap,
	HookListenerSet,
	HookablePropertyNames,
	HookPropertyListener,
	HookableMethods,
	HookableMethodNames,
	HookParamsListener,
	HookMethodListener,
	HookResultListener,
} from './types'
import { getHookMap } from './functions'

export class Hook<Target extends Hookable> {
	constructor(
		Hookable: HookableClass<Target>,
		protected hooks = getHookMap(Hookable)
	) {}

	on<K extends keyof Target>(
		key: K,
		listener: HookListener<Target, Target[K]>,
		level = 10,
		type = 'get'
	) {
		if (!this.hooks.has(type)) this.hooks.set(type, new Map())
		const typeMap = this.hooks.get(type) as HookMap

		if (!typeMap.has(key)) typeMap.set(key, new Map())
		const levelMap = typeMap.get(key) as HookLevelMap

		if (!levelMap.has(level)) levelMap.set(level, new Set())
		const listeners = levelMap.get(level) as HookListenerSet

		listeners.add(listener)
		return () => listeners.delete(listener)
	}

	get<Key extends keyof Target>(
		key: Key,
		listener: HookListener<Target, Target[Key]>,
		level = 10
	) {
		return this.on(key, listener, level, 'get')
	}

	set<Key extends keyof Target>(
		key: Key,
		listener: HookListener<Target, Target[Key]>,
		level = 10
	) {
		return this.on(key, listener, level, 'set')
	}

	property<Property extends HookablePropertyNames<Target>>(
		property: Property,
		listener: HookPropertyListener<Target, Property>,
		level = 10
	) {
		return this.get(
			property as any,
			context => {
				context.value = listener.call(context.target, context.value)
			},
			level
		)
	}

	params<
		Methods extends HookableMethods<Target>,
		Method extends HookableMethodNames<Target>
	>(
		method: Method,
		listener: HookParamsListener<Target, Methods[Method]>,
		level = 10
	) {
		return this.on(
			method as any,
			context => {
				const func = context.value as FunctionType
				context.value = (...args: any[]) => {
					const params = listener.call(context.target, args as any)
					return func.call(context.target, ...params)
				}
			},
			level,
			'params'
		)
	}

	method<
		Methods extends HookableMethods<Target>,
		Method extends HookableMethodNames<Target>
	>(
		method: Method,
		listener: HookMethodListener<Target, Methods[Method]>,
		level = 10
	) {
		return this.on(
			method as any,
			context => {
				context.value = listener.bind(
					context.target,
					context.value.bind(context.target)
				)
			},
			level,
			'method'
		)
	}

	result<
		Methods extends HookableMethods<Target>,
		Method extends HookableMethodNames<Target>
	>(
		method: Method,
		listener: HookResultListener<Target, Methods[Method]>,
		level = 10
	) {
		return this.on(
			method as any,
			context => {
				const func = context.value as FunctionType
				context.value = (...args: any[]) => {
					const result = func.call(context.target, ...args)
					return listener.call(context.target, result)
				}
			},
			level,
			'result'
		)
	}

	trigger<K extends keyof Target>(
		target: Target,
		key: K,
		value: Target[K],
		type: string = 'get'
	) {
		if (!this.hooks.has(type)) return value
		const typeMap = this.hooks.get(type) as HookMap
		if (!typeMap.has(key)) return value

		const levelMap = typeMap.get(key) as HookLevelMap
		const listeners = Array.from(levelMap)
			.sort(([a], [b]) => a - b)
			.flatMap(([_, a]) => Array.from(a))

		let stopped = false
		const context = {
			target,
			value,
			stop: () => {
				stopped = true
			},
		}

		for (const listener of listeners) {
			listener.call(target, context)
			if (stopped) break
		}

		return context.value
	}
}
