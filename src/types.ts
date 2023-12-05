import { FunctionType } from '@sa-net/utils'
import { Hookable, HookableClass } from './Hookable'

export type HookContext<Target extends Hookable, Value> = {
	target: Target
	value: Value
	stop: () => void
}

export type HookListener<Target extends Hookable, Value> = (
	this: Target,
	context: HookContext<Target, Value>
) => void

export type HookablePropertyNames<Target extends Hookable> = {
	[K in keyof Target]: Target[K] extends FunctionType ? never : K
}[keyof Target]

export type HookableMethodNames<Target extends Hookable> = {
	[K in keyof Target]: Target[K] extends FunctionType ? K : never
}[keyof Target]

export type HookableMethods<Target extends Hookable> = {
	[K in keyof Target]: Target[K] extends FunctionType ? Target[K] : never
}

export type HookParamsListener<
	Target extends Hookable,
	Method extends FunctionType
> = (this: Target, params: Parameters<Method>) => Parameters<Method>

export type HookMethodListener<
	Target extends Hookable,
	Method extends FunctionType
> = (
	this: Target,
	method: Method,
	...args: Parameters<Method>
) => ReturnType<Method>

export type HookResultListener<
	Target extends Hookable,
	Method extends FunctionType
> = (this: Target, result: ReturnType<Method>) => ReturnType<Method>

export type HookPropertyListener<
	Target extends Hookable,
	Property extends HookablePropertyNames<Target>
> = (this: Target, value: Target[Property]) => Target[Property]

export type HookListenerSet = Set<HookListener<any, any>>
export type HookLevelMap = Map<number, HookListenerSet>
export type HookMap = Map<any, HookLevelMap>
export type HookTypeMap = Map<string, HookMap>
export type HookableMap = Map<HookableClass<any>, HookTypeMap>
