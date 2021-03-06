<p align="center">
  <img height="300" src="logo.svg">
</p>

# Unis

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

Unis 并不是 React 的复刻，而是保留了 React 使用体验的全新框架，Unis 的用法很简单，熟悉 React 的也可以很快上手。

### 组件

在 Unis 中组件是一个高阶函数。

```jsx
import { h, render } from '@unis/unis'

const App = () => {
  return () => ( // 返回一个函数
    <div>
      hello world
    </div>
  )
}

render(<App />, document.querySelector('#root'))
```

### 组件状态

Unis 中的 useState 用法和 React 相似，但是要注意的是 Unis 中 `use` 系列方法，定义类型必须为 `let` ，因为 Unis 使用了 Callback Reassign 编译策略，rollup-plugin-reassign 帮我们补全了 Callback Reassign 代码。

```jsx
const App = () => {
  let [msg, setMsg] = useState('hello');
  /**
   * Compile to:
   * 
   * let [msg, setMsg] = useState('hello', ([$0, $1]) => { msg = $0, setMsg = $1 });
   */
  return () => (
    <div>{msg}</div>
  )
}
```

### Props

Unis 直接使用 props 会无法获取最新值，所以 Unis 提供了 useProps。

```jsx
const App = (p) => {
  let { some } = useProps(p)
  /**
   * Compile to:
   * 
   * let { some } = useProps(p, ({ some: $0 }) => { some = $0 });
   */
  return () => (
    <div>{some}</div>
  )
}
```

### 副作用

Unis 保留了和 React 基本一致的 useEffect ，但 deps 是一个返回数组的函数。

```jsx
const App = () => {

  useEffect(
    () => {
      // ...
      return () => {
        // 清理...
      }
    },
    () => [] // deps 是一个返回数组的函数
  )

  return () => (
    <div>hello</div>
  )
}
```

### 自定义 hook

Unis 的自定义 hook ，在有返回值的场景需要搭配 use 方法使用，原因则是前面提到的 Callback Reassign 编译策略。

```jsx
// 创建 hook，hook 为高阶函数
const Count = () => {
  let [count, setCount] = useState(0);
  const add = () => setCount(count + 1);
  return () => [count, add]
}

// 通过 `use` 使用 hook
function App() {
  let [count, add] = use(Count());
  /**
   * Compile to:
   * 
   * let [count, add] = use(Count(), ([$0, $1]) => { count = $0; add = $1 });
   */
  return () => (
    <div onClick={add}>{count}</div>
  )
}
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
  let theme = useContext(ThemeContext)
  
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

完整项目请查看

- [packages/unis-example](packages/unis-example) Todo 示例
- [stackbliz](https://stackblitz.com/edit/vitejs-vite-4cfy2b) 试用

## API

- Core
  - h
  - h2 (for jsx2)
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