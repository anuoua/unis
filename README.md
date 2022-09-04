<p align="center">
  <img height="300" src="logo.svg">
</p>

# Unis [中文](README-zh_CN.md)

Unis is a simpler and easier to use front-end framework than React

## Install

```bash
npm i @unis/unis
````

## Vite development

```jsx
npm i vite @unis/vite-preset -D
````

vite.config.js

```jsx
import { defineConfig } from "vite";
import { unisPreset } from "@unis/vite-preset";

export default defineConfig({
  plugins: [unisPreset()]
});
````

index.html

```jsx
<html>
  ...
  <body>
    <div id="root"></div>
    <script type="module" src="./index.tsx"></script>
  </body>
</html>
````

index.tsx

```tsx
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

Unis is not a fork of React, but a brand-new framework that retains the experience of using React. The usage of Unis is very simple, and those familiar with React can get started quickly.

### Components

A component in unis is a higher-order function.

```jsx
import { render } from '@unis/unis'

const App = () => {
  return () => ( // return a function
    <div>
      hello world
    </div>
  )
}

render(<App />, document.querySelector('#root'))
````

### Component State

The usage of `useState` in Unis is similar to that of React, but it should be noted that for the `use` series methods in unis, the definition type must be `let`, because unis uses the Callback Reassign compilation strategy, and rollup-plugin-reassign helps us complete it Callback Reassign code.

```jsx
const App = () => {
  let [msg, setMsg] = useState('hello');
  /**
   * Compile to:
   *
   * let [msg, setMsg] = useState('hello', ([$0, $1]) => { msg = $0; setMsg = $1 });
   */
  return () => (
    <div>{msg}</div>
  )
}
````

### Props

Unis will not be able to get the latest value when using props directly, so unis provides useProps.

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
````

### Side effect

Unis keeps `useEffect` and `useLayoutEffect` basically the same as React, but deps is a function that returns an array.

```jsx
const App = () => {

  useEffect(
    () => {
      // ...
      return() => {
        // clean up...
      }
    },
    () => [] // deps is a function that returns an array
  )

  return () => (
    <div>hello</div>
  )
}
````

### Custom hook

The custom hook of Unis needs to be used with the `use` method in scenarios with return values, because of the Callback Reassign compilation strategy mentioned above. The naming convention of custom hooks starts with a lowercase letter `u`, which is used to distinguish other functions, and at the same time, it is more convenient to import at the prompt of IDE.

```jsx
// Create custom hook higher-order function
const uCount = () => {
  let [count, setCount] = useState(0);
  const add = () => setCount(count + 1);
  return () => [count, add]
}

// use hook via `use`
function App() {
  let [count, add] = use(uCount());
  /**
   * Compile to:
   *
   * let [count, add] = use(uCount(), ([$0, $1]) => { count = $0; add = $1 });
   */
  return () => (
    <div onClick={add}>{count}</div>
  )
}
````

## Features

### Fragment

```jsx
import { Fragment } from '@unis/unis'

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
import { createPortal } from '@unis/unis'

function App() {
  return () => createPortal(
    <div></div>,
    document.body
  )
}
````

### Context

```jsx
import { createContext, render } from '@unis/unis'

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
  - FGMT: it is Fragment alias, will be removed when vite support `jsxImportSource`
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
  - useMemo
  - useEffect
  - useRef
  - useId

## License

MIT @anuoua