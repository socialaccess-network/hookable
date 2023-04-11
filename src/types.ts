import { ClassType, FunctionType } from '@michealpearce/utils'
import { Hookable } from './Hookable'

export type HookableClass<H extends Hookable> = ClassType<
	H,
	any[],
	typeof Hookable
>

export interface HookContext<V> extends Record<string, any> {
	value: V
	stop(): void
}

export type HookFunc<T, V> = (
	this: T,
	context: HookContext<V>,
) => void | undefined

export type HookLevelMap = Map<number, Set<FunctionType>>
export type HookPropMap = Map<any, HookLevelMap>
export type HookTypeMap = Map<string, HookPropMap>
