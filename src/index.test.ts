import { expect, it } from 'vitest'
import { Hookable, NotHookable } from './Hookable'
import { createHookable, hookTo } from './functions'
import { Hooks } from './Hookable'
import { sleep } from '@michealpearce/utils'

it('tests hookable', () => {
	class Test extends Hookable {
		static [Hooks] = new Map()

		greeting = 'Hello'

		greet(name: string) {
			return `${this.greeting} ${name}`
		}
	}

	class Extended extends Test {
		greeting = 'Hi'
	}

	const hook = hookTo(Test)
	const extendedHook = hookTo(Extended)

	const test = new Test()
	const extended = new Extended()

	hook.get('greeting', (context) => {
		context.value = `${context.value},`
	})

	expect(test.greeting).toBe('Hello,')
	expect(extended.greeting).toBe('Hi,')
	expect(test.greet('World')).toBe('Hello, World')
	expect(extended.greet('World')).toBe('Hi, World')

	// tests hook priority and off
	const off = extendedHook.get('greeting', (context) => {
		context.value = `${context.value}!`
	})

	expect(test.greet('World')).toBe('Hello, World')
	expect(extended.greet('World')).toBe('Hi,! World')

	off()
	expect(extended.greet('World')).toBe('Hi, World')

	// tests stop hook, priority, and hooks not creeping up the prototype chain
	extendedHook.get(
		'greeting',
		(context) => {
			context.value = `${context.value}!`
			context.stop()
		},
		0,
	)

	expect(test.greet('World')).toBe('Hello, World')
	expect(extended.greet('World')).toBe('Hi! World')
})

it('tests hookable that doesnt extend Hookable class', () => {
	class Test {
		static [Hooks] = new Map()

		greeting = 'Hello'

		constructor() {
			return createHookable(this, new.target)
		}

		greet(name: string) {
			return `${this.greeting} ${name}`
		}
	}

	const hook = hookTo(Test)
	const test = new Test()

	hook.get('greeting', (context) => {
		context.value = `${context.value},`
	})

	expect(test.greet('World')).toBe('Hello, World')
})

it('tests hookable ignored keys', () => {
	class Test extends Hookable {
		static [Hooks] = new Map()
		static [NotHookable] = ['greeting']

		greeting = 'Hello'

		greet(name: string) {
			return `${this.greeting} ${name}`
		}
	}

	const hook = hookTo(Test)
	const test = new Test()

	hook.get('greeting', (context) => {
		context.value = `${context.value},`
	})

	expect(test.greet('World')).toBe('Hello World')
	expect(test.greeting).toBe('Hello')
})

it('tests hookable functions', () => {
	class Test extends Hookable {
		static [Hooks] = new Map()

		greeting = 'Hello'

		greet(name: string) {
			return `${this.greeting} ${name}`
		}
	}

	const hook = hookTo(Test)
	const test = new Test()

	hook.get('greet', (context) => {
		const func = context.value
		context.value = () => `${func.call(this, 'World')}!`
	})

	expect(test.greet('World')).toBe('Hello World!')
})

it('tests hookable before and after functions', async () => {
	let count = 0

	class Test extends Hookable {
		static [Hooks] = new Map()

		prop = 'value'

		async method() {
			expect(count).toBe(2)
			count++
		}
	}

	const hook = hookTo(Test)

	hook.before('method', function () {
		expect(count).toBe(1)
		count++
	})

	hook.before('method', async function () {
		expect(count).toBe(0)
		count++
	})

	hook.after('method', async function () {
		expect(count).toBe(3)
		count++
	})

	hook.after('method', function () {
		expect(count).toBe(4)
		count++
	})

	const test = new Test()

	await test.method()
	expect(count).toBe(5)
})

it('tests hookable function params', () => {
	class Test extends Hookable {
		static [Hooks] = new Map()

		method(name: string, age: number) {
			return `${name} is ${age} years old`
		}
	}

	const hook = hookTo(Test)

	hook.params('method', ([name, age]) => [`Mr ${name}`, age * 2])

	const test = new Test()

	expect(test.method('John', 20)).toBe('Mr John is 40 years old')
})

it('tests hookable function result', async () => {
	class Test extends Hookable {
		static [Hooks] = new Map()

		async method(name: string) {
			return name.length
		}
	}

	const hook = hookTo(Test)

	hook.result('method', async (result) => {
		await sleep(1000)
		return result + 1
	})

	hook.result('method', async (result) => {
		await sleep(1000)
		return result - 1
	})

	const test = new Test()

	const result = await test.method('John')
	expect(result).toBe(4)
})

it('tests hookable sets', () => {
	class Test extends Hookable {
		static [Hooks] = new Map()

		prop = 'hello'
	}

	const hook = hookTo(Test)

	hook.set('prop', (context) => {
		context.value = context.value.toUpperCase()
	})

	const test = new Test()

	test.prop = 'world'
	expect(test.prop).toBe('WORLD')
})

it('tests hooking Hookable class directly', () => {
	let errored = false

	try {
		hookTo(Hookable)
	} catch (error) {
		errored = true
	}

	expect(errored).toBe(true)
})

it('tests constructing Hookable class directly', () => {
	let errored = false

	try {
		new Hookable()
	} catch (error) {
		errored = true
	}

	expect(errored).toBe(true)
})

it('tests sync after hooks', () => {
	let count = 0

	class Test extends Hookable {
		static [Hooks] = new Map()

		method() {
			expect(count).toBe(0)
			count++
		}
	}

	const hook = hookTo(Test)

	hook.after('method', () => {
		expect(count).toBe(1)
		count++
	})

	hook.result('method', () => {
		expect(count).toBe(2)
		count++
	})

	const test = new Test()

	test.method()
	expect(count).toBe(3)
})

it('tests calling createHookable on Hookable directly', () => {
	let errored = false

	try {
		createHookable(new (class {})(), Hookable)
	} catch (error) {
		errored = true
	}

	expect(errored).toBe(true)
})

it('tests extending hookables', () => {
	class Test extends Hookable {
		static [Hooks] = new Map()

		prop = 'hello'
	}

	class Test2 extends Test {
		prop = 'world'
	}

	class Test3 extends Test2 {}

	const testHook = hookTo(Test)
	const test2Hook = hookTo(Test2)

	testHook.get('prop', (context) => {
		context.value = context.value.toUpperCase()
	})

	test2Hook.get('prop', (context) => {
		context.value = context.value.toLowerCase()
	})

	const test = new Test3()

	expect(test.prop).toBe('world')
})
