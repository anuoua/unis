# Unis 中文

Unis 是一款比 React 更简单易用的前端框架

## 安装

```bash
npm i @unis/unis
```

## Vite 开发

```jsx
npm i vite rollup-plugin-reassign -D
```

vite.config.js

```jsx
import { defineConfig } from "vite";
import { reassign } from "rollup-plugin-reassign";

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  },
  reassign({
    include: ["**/*.(t|j)s?(x)"],
    targetFns: {
      "@unis/unis": {
        use: 1,
        useState: 1,
        useProps: 1,
        useContext: 1,
        useReducer: 2,
      },
    },
  })
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

Unis 的用法很简单，熟悉 React 的可以很快上手。

```jsx
import { h, render, useState, useEffect, useProps } from '@unis/unis'

function Main(props) {
  let { context } = useProps(props)
  return () => (
    <main>{content}</main>
  )
}

function App() {
  let [hello, setHello] = useState('hello')
  let [title, setTitle] = useState('example')

  useEffect(() => {
    setHello('hello world!')
  }, () => [])

  return () => (
    <div>
      <head>{title}</head>
      <Main content={hello} />
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

### Portal

```jsx
import { h, createPortal } from '@unis/unis'

function App() {
  return () => createPortal(
    <div></div>,
    document.body
  )
}
```

### Context

```jsx
import { h, createContext, render } from '@unis/unis'

const ThemeContext = createContext('light')

function App() {
  const theme = useContext(ThemeContext)
  
  return () => (
    <div>{theme}</div>
  )
}

render(
  <ThemeContext.Provider value="dark">
    <App />
  </ThemeContext.Provider>,
  document.querySelector('#root')
)
```

## Todo 项目

完整项目请查看 [packages/unis-example](packages/unis-example) Todo 示例。

## API

Unis 的 API 和 React 相似。

- Framework
  - h
  - h2
  - Fragment
  - createPortal
  - createContext
  - render
  - memo

- Hooks
  - use
  - useProps
  - useState
  - useReducer
  - useContext
  - useEffect
  - useRef
  - useId

## License

MIT @anuoua