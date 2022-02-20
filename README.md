# Unis

Unis is a simpler and easier to use front-end framework than React

## Install

```bash
npm i @unis/unis
```

## Vite Dev

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

## Usage

The usage of Unis is very simple, and those who are familiar with React can get started quickly.

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

## Todo Project

See the [packages/unis-example](packages/unis-example) Todo example for the full project.

## API

Unis' API is similar to React.

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