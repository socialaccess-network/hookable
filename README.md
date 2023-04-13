# @sa-net/hookable

This package provides a simple way to create hookable class objects.

## Installation

```bash
yarn add @sa-net/hookable
# or
npm install @sa-net/hookable
```

## Usage

Any class that extends `Hookable` can be passed to `hookTo` and allows you to hook into the properties and methods of the class.

```typescript
import { Hookable, hookTo } from '@sa-net/hookable'

class MyClass extends Hookable {
	greeting = 'Hello'

	greet(name: string) {
		return `${this.greeting} ${name}`
	}
}

const hook = hookTo(MyClass)

// append ',' to the result of the greeting property
hook.get('greeting', (context) => {
	context.value = `${context.value},`
})

// append '!' to the result of the greet method
hook.get('greet', (context) => {
	const func = context.value
	context.value = (name) => {
		return `${func(name)}!`
	}
})

const myClass = new MyClass()

console.log(myClass.greet('World')) // Hello, World!
```

Classes can be hooked into without extending `Hookable` by returning the result of `createHookable` from the class constructor. This is useful if you want to create a hookable but want your class to extend another class besides `Hookable`.

```typescript
import { createHookable, hookTo } from '@sa-net/hookable'

class MyClass {
	constructor() {
		return createHookable(this, new.target)
	}
}

const hook = hookTo(MyClass)
```

### Priorities

Hooks can be given a priority to control the order in which they are called. The default priority is `10`. Hooks with a lower priority are called first.

```typescript
const hook = hookTo(MyClass)

// append ',' to the result of the greeting property
hook.get(
	'greeting',
	(context) => {
		context.value = `${context.value},`
	},
	1,
) // runs second

// append '!' to the result of the greeting property
hook.get(
	'greeting',
	(context) => {
		context.value = `${context.value}!`
	},
	0,
) // runs first

const myClass = new MyClass()
console.log(myClass.greeting) // Hello!,
```

### Stopping Hook Execution

If you want to stop the execution of a hook, you can call `context.stop()`.

```typescript
const hook = hookTo(MyClass)

// does not run because the previous hook stops execution
hook.get('greeting', (context) => {
	context.value = `${context.value},`
})

// runs first
hook.get(
	'greeting',
	(context) => {
		context.value = `${context.value}!`
		context.stop()
	},
	0,
)

const myClass = new MyClass()
console.log(myClass.greeting) // Hello!
```

### Passing Data Between Hooks

If you want to pass data between hooks, you can use the `context` object itself.

```typescript
const hooks = hookTo(MyClass)

hooks.get('greeting', (context) => {
	context.appendComma = true
})

hooks.get('greeting', (context) => {
	if (context.appendComma) {
		context.value = `${context.value},`
	}
})

const myClass = new MyClass()
console.log(myClass.greeting) // Hello,
```

### Marking Properties and Methods as not Hookable

If you want to mark a property or method as not hookable, you set the static `NotHookable` symbol to an array of keys.

```typescript
import { Hookable, hookTo, NotHookable } from '@sa-net/hookable'

class MyClass extends Hookable {
	static [NotHookable] = ['greet']

	greeting = 'Hello'

	greet(name: string) {
		return `${this.greeting} ${name}`
	}
}
```
