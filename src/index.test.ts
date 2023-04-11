import { expect, it } from 'vitest'
import { Hookable, NotHookable } from './Hookable'
import { createHookable, hookTo } from './functions'

it('tests hookable', () => {
	class Test extends Hookable {
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
