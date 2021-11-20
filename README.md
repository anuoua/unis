# Unis

A simple frontend framwork inspired by Vue & React.

Unis looks like React but drive by `@vue/reactivity`. if you like React (hate hooks) and Vue's reactive system，you will have fun with it.

## Install

```shell
npm i @unis/unis
```

## Example

```javascript
import { render, ref } from '@unis/unis'

function App() {
  const hello = ref('hello world')

  return () => ( // return a function!
    <div>{hello.value}</div>
  )
}

render(<App />, document.body)
```

## API

Unis's basic API is almost the same as vue's composition API. See [Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html#why-composition-api)

- ref
- reactive
- ...
- watch
- watchEffect

life circle

- onBeforeMount
- onMounted
- onBeforeUpdate
- onUpdated
- onBeforeUnmount
- onUnmounted

schedual

- nextTick
- forceUpdator
- nextTickUpdator

## Others

Teleport Support

## Todos

- [ ] Context API
- [ ] Suspense support
- [ ] Transition support
- [ ] Unis router
