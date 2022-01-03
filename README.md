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

## Usage

The Unis's usage is easy, and you can get started quickly if you are familiar with React & Vue 3.

```jsx
import { h, render, ref, onMounted } from '@unis/unis'

function Main(props) {
  return () => (
    <main>{props.content}</main>
  )
}

function App() {
  const hello = ref('hello')
  const title = ref('example')
  
  onMounted(() => { hello.value = 'hello world!' })	

  return () => (
    <div>
      <head>{title.value}</head>
      <Main content={hello.value} />
    </div>
  )
}

render(<App />, document.querySelector('#root'))
```

## Feature

### Fragment

```jsx
import { h, Fragment } from '@unis/unis'

function App() {
  return () => (
    <Fragment>
      <div></div>
      <span></span>
    </Fragment>
  )
}
```

### Teleport

```jsx
import { h, Teleport } from '@unis/unis'

function App() {
  return () => (
    <Teleport to={document.body}>
      <div></div>
    </Fragment>
  )
}
```

### Context API（Experimental）

```jsx
import { h, createContext, render } from '@unis/unis'

const MainContext = createContext({ name: '' })

function App() {
  const ctx = MainContext.getValue();
  
  return () => (
    <div>{ctx.name}</div>
  )
}

render(
  <MainContext.Provider value={{ name: 'hello' }}>
    <App />
  </MainContext.Provider>,
  document.querySelector('#root')
)
```

## API

Unis's API like Vue's Composition API.

- [Reactivity](https://v3.vuejs.org/api/reactivity-api.html) API
    - ref
    - reactive
    - computed
    - ...
    - watch*
    - watchEffect*

> * Partially Supported

- 生命周期
    - onBeforeMount
    - onMounted
    - onBeforeUpdate
    - onUpdated
    - onBeforeUnmount
    - onUnmounted
    - onErrorCaptured
    - onRenderTracked
    - onRenderTriggered
- 其他
    - nextTick
    - forceUpdator
    - nextTickUpdator
