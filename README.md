# Unis

A simple frontend framwork inspired by Vue & React.

Unis looks like React but drive by `@vue/reactivity`. if you like React (hate hooks) and Vue's reactive system，you will have fun with it.

## Install

```shell
npm i @unis/unis
```

## Vite try

```shell
npm i @unis/unis vite
```

vite.config.json

```javascript
import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
});
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
  - ~~*onErrorCaptured*~~
  - ~~*onRenderTracked*~~
  - ~~*onRenderTriggered*~~

- Schedule
  - nextTick

- Updator
  - forceUpdator
  - nextTickUpdator

## Others

Teleport is supported

Fragment is supported

## Todos

- [ ] Context API
- [ ] Suspense support
- [ ] Transition support
- [ ] Unis Router
