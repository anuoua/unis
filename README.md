# Unis [中文](README-zh_CN.md)

Unis is a simpler and easier to use front-end framework than React

## Install

```bash
npm i @unis/unis
````

## Vite development

```jsx
npm i vite rollup-plugin-reassign -D
````

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
````

index.html

```jsx
<html>
  ...
  <body>
    <div id="root"></div>
    <script type="module" src="./index.jsx"></script>
  </body>
</html>
````

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
````

## Usage

Unis is not a copy of React, but a brand new framework that retains the experience of using React. Unis is very simple to use, and those who are familiar with React can get started quickly.

### Components

A component in Unis is a higher-order function.

```jsx
import { h, render } from '@unis/unis'

const App = () => {
  return () => ( // return a function
    <div>
      hello world
    </div>
  )
}

render(<App />, document.querySelector('#root'))
````

### Component Status

The usage of **useState** in Unis is similar to that of React, but it should be noted that for the **use** series methods in Unis, the definition type must be **let** , because Unis uses the **Callback Reassign** compilation strategy, and rollup-plugin-reassign helps us complete the Callback Reassign code.

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
````

### Props

Unis will not be able to get the latest value when using props directly, so Unis provides useProps.

```jsx
const App = (p) => {
  let { some } = useProps(p)
  /**
   * Compile to:
   *
   * let { some } = useProps(p, ({ some: $0 }) => { $0 = some });
   */
  return () => (
    <div>{some}</div>
  )
}
````

### side effect

Unis retains **useEffect** which is basically the same as React, but Deps is a function that returns an array.

```jsx
const App = () => {

  useEffect(
    () => {
      // ...
      return() => {
        // clean up...
      }
    },
    () => [] // Deps is a function that returns an array
  )

  return () => (
    <div>hello</div>
  )
}
````

### Custom hook

The custom hook of Unis needs to be used with the **use** method in scenarios with return values, because of the **Callback Reassign** compilation strategy mentioned above.

```jsx
// Create hook, hook is a higher-order function
const Count = () => {
  let [count, setCount] = useState(0);
  const add = () => setCount(count + 1);
  return () => [count, add]
}

// use hook with `use`
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
````

## Features

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
````

### Portal

```jsx
import { h, createPortal } from '@unis/unis'

function App() {
  return () => createPortal(
    <div></div>,
    document.body
  )
}
````

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
````

## Todo Project

Check out the full project

- [packages/unis-example](packages/unis-example) Todo example
- [stackbliz](https://stackblitz.com/edit/vitejs-vite-4cfy2b) Trial

##API

- Core
  - h
  - h2 (for jsx2)
  - Fragment
  - createPortal
  - createContext
  -render
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
