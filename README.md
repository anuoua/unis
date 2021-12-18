# Unis [中文](./README-zh_CN.md)

A simple frontend framwork inspired by Vue & React.

Unis looks like React but drive by `@vue/reactivity`. if you like React (hate hooks) and Vue's reactive system，you will have fun with it.

## Install

```shell
npm i @unis/unis
```

## Vite try

```jsx
npm i vite -D
```

vite.config.js

```jsx
import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
});
```

index.html

```jsx
<html>
  ...
  <body>
    <div id="root"></div>
    <script type="module" src="./index.jsx"></script>
  </body>
</html>
```

index.jsx

```jsx
import { h } from '@unis/unis'

function App() {
  return () => (
    <div>
      hello
    </div>
  )
}

render(<App />, document.querySelector('#root'))
```

See [todo example](packages/unis-example)

## API

Unis's API is like vue's composition API.

- [Reactivity](https://v3.vuejs.org/api/reactivity-api.html)
  - ref
  - reactive
  - ...
  - watch*
  - watchEffect*

> \* is partial support

- Lifecircle
  - onBeforeMount
  - onMounted
  - onBeforeUpdate
  - onUpdated
  - onBeforeUnmount
  - onUnmounted
  - onErrorCaptured
  - onRenderTracked
  - onRenderTriggered

- Schedule
  - nextTick

- Updator
  - forceUpdator
  - nextTickUpdator

## Others

Teleport is supported

Fragment is supported

## Todos

- [x] Context API
- [ ] Suspense support
- [ ] Transition support
- [ ] Unis Router
