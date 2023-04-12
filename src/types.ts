import { ClassType, FunctionType } from '@michealpearce/utils'
import { Hookable } from './Hookable'

export type HookableClass<H extends Hookable> = ClassType<
	H,
	any[],
	typeof Hookable
>

export interface HookContext<T, V> extends Record<string, any> {
	reciever: T
	value: V
	stop(): void
}

export type HookFunc<T, V> = (
	this: T,
	context: HookContext<T, V>,
) => void | undefined

export type HookLevelMap = Map<number, Set<FunctionType>>
export type HookPropMap = Map<any, HookLevelMap>
export type HookTypeMap = Map<string, HookPropMap>
export type HookContainer = Map<HookableClass<any>, HookTypeMap>

type HookParams<T> = T extends FunctionType ? Parameters<T> : never
type HookReturn<T> = T extends FunctionType
	? ReturnType<T> extends Promise<any>
		? void | Promise<void>
		: void | undefined
	: never

export type HookBeforeOrAfterFunc<T extends Hookable, K extends keyof T> = (
	this: T,
	params: HookParams<T[K]>,
) => HookReturn<T[K]>

export type HookParamsFunc<T extends Hookable, K extends keyof T> = (
	this: T,
	params: HookParams<T[K]>,
) => HookParams<T[K]>
