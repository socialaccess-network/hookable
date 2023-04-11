import { FunctionType } from '@michealpearce/utils'
import { Hookable, NotHookable } from './Hookable'
import { HookContainer, HookFunc, HookLevelMap, HookableClass } from './types'

const globalHooks: HookContainer = new Map()

export function hookTo<H extends Hookable>(
	HC: HookableClass<H>,
	container: HookContainer = globalHooks,
) {
	function add(type: string, key: any, hook: FunctionType, level = 10) {
		const typeHooks = container.get(HC) || new Map()
		container.set(HC, typeHooks)

		const propHooks = typeHooks.get(type) || new Map()
		typeHooks.set(type, propHooks)

		const levelHooks = propHooks.get(key) || new Map()
		propHooks.set(key, levelHooks)

		const hooks = levelHooks.get(level) || new Set()
		levelHooks.set(level, hooks)

		hooks.add(hook)

		return () => hooks.delete(hook)
	}

	return {
		get<K extends keyof H>(key: K, hook: HookFunc<H, H[K]>, level?: number) {
			return add('get', key, hook, level)
		},
		set<K extends keyof H>(key: K, hook: HookFunc<H, H[K]>, level?: number) {
			return add('set', key, hook, level)
		},
	}
}

export function createHookable<H extends Hookable>(
	target: H,
	HC: HookableClass<H>,
	container: HookContainer = globalHooks,
): H {
	return new Proxy(target, {
		get(target, key, reciever) {
			let value = Reflect.get(target, key, reciever)
			if (typeof value === 'function') value = value.bind(reciever)
			return runHook(container, HC, 'get', key, value, reciever)
		},
		set(target, key, value, reciever) {
			value = runHook(container, HC, 'set', key, value, reciever)
			return Reflect.set(target, key, value, reciever)
		},
	})
}

function runHook(
	container: HookContainer,
	HC: HookableClass<any>,
	type: string,
	key: any,
	value: any,
	reciever: any,
) {
	if (HC[NotHookable]?.includes(key)) return value

	const hooks = getHooks(container, HC, type, key)
	const sorted = Array.from(hooks)
		.sort(([a], [b]) => a - b)
		.flatMap(([, hks]) => Array.from(hks))
	if (!sorted.length) return value

	let stopped = false
	const context = {
		value,
		stop() {
			stopped = true
		},
	}

	for (const hook of sorted)
		if (stopped) break
		else hook.call(reciever, context)

	return context.value
}

function getHooks(
	container: HookContainer,
	HC: HookableClass<any>,
	type: string,
	key: any,
): HookLevelMap {
	const hooks: HookLevelMap = new Map()
	const proto = Reflect.getPrototypeOf(HC) as HookableClass<any> | null

	if (proto) {
		const parentHooks = getHooks(container, proto, type, key)
		for (const [level, hks] of parentHooks) {
			if (!hooks.has(level)) hooks.set(level, new Set(hks))
			else {
				const hooksSet = hooks.get(level)!
				for (const hook of hks) hooksSet.add(hook)
			}
		}
	}

	const typeHooks = container.get(HC)
	if (!typeHooks) return hooks

	const propHooks = typeHooks.get(type)
	if (!propHooks) return hooks

	const levelHooks = propHooks.get(key)
	if (!levelHooks) return hooks

	for (const [level, hks] of levelHooks) {
		if (!hooks.has(level)) hooks.set(level, new Set(hks))
		else {
			const hooksSet = hooks.get(level)!
			for (const hook of hks) hooksSet.add(hook)
		}
	}

	return hooks
}
