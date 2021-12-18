# Unis 中文

Unis 是一款受 Vue 和 React 启发的简单的前端框架。

Unis 看起来像 React，但由 @vue/reactivity 驱动。如果你喜欢 React（讨厌hooks）和 Vue 的响应式系统，你会喜欢 Unis。

## 安装

```bash
npm i @unis/unis
```

## Vite 开发

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

## 用法

Unis 的用法很简单，熟悉 React 可以很快上手。

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

## 特性

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

### Context API（实验中）

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

Unis 的 API 和 vue 的 Composition API 大概一致。

- [Reactivity](https://v3.vuejs.org/api/reactivity-api.html) API
    - ref
    - reactive
    - computed
    - ...
    - watch*
    - watchEffect*

> * 是部分支持
> 
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