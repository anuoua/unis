<p align="center">
  <img height="300" src="logo.svg">
</p>

[![@unis/core CI/CD](https://github.com/anuoua/unis/actions/workflows/unis-core.yml/badge.svg)](https://github.com/anuoua/unis/actions/workflows/unis-core.yml) [![@unis/dom CI/CD](https://github.com/anuoua/unis/actions/workflows/unis-dom.yml/badge.svg)](https://github.com/anuoua/unis/actions/workflows/unis-dom.yml) [![@unis/router CI/CD](https://github.com/anuoua/unis/actions/workflows/unis-router.yml/badge.svg)](https://github.com/anuoua/unis/actions/workflows/unis-router.yml) [![@unis/transition CI/CD](https://github.com/anuoua/unis/actions/workflows/unis-transition.yml/badge.svg)](https://github.com/anuoua/unis/actions/workflows/unis-transition.yml) [![@unis/vite-preset CI/CD](https://github.com/anuoua/unis/actions/workflows/unis-vite-preset.yml/badge.svg)](https://github.com/anuoua/unis/actions/workflows/unis-vite-preset.yml) [![@unis/babel-preset CI/CD](https://github.com/anuoua/unis/actions/workflows/unis-babel-preset.yml/badge.svg)](https://github.com/anuoua/unis/actions/workflows/unis-babel-preset.yml)

# Unis

Unis 是一款比 React 更简单易用的前端框架

## 安装

```bash
npm i @unis/core @unis/dom
```

## Vite 开发

```shell
npm i vite @unis/vite-preset -D
```

vite.config.js

```javascript
import { defineConfig } from "vite";
import { unisPreset } from "@unis/vite-preset";

export default defineConfig({
  plugins: [unisPreset()],
});
```

tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@unis/core"
  }
}
```

index.html

```javascript
<html>
  ...
  <body>
    <div id="root"></div>
    <script type="module" src="./index.tsx"></script>
  </body>
</html>
```

index.tsx

```javascript
function App() {
  return () => <div>hello</div>;
}

render(<App />, document.querySelector("#root"));
```

## 用法

Unis 并不是 React 的复刻，而是保留了 React 使用体验的全新框架，unis 的用法很简单，熟悉 React 的可以很快上手。

### 组件

在 unis 中组件是一个高阶函数。

```javascript
import { render } from "@unis/dom";

const App = () => {
  return () => (
    // 返回一个函数
    <div>hello world</div>
  );
};

render(<App />, document.querySelector("#root"));
```

### 组件状态

Unis 中的 `useState` 用法和 React 相似，但是要注意的是 unis 中 `use` 系列方法，定义类型必须为 `let` ，因为 unis 使用了 Callback Reassign 编译策略，[@callback-reassign/rollup-plugin](https://github.com/anuoua/callback-reassign) 帮我们补全了 Callback Reassign 代码。

```javascript
import { useState } from "@unis/core";

const App = () => {
  let [msg, setMsg] = useState("hello");
  /**
   * Compile to:
   *
   * let [msg, setMsg] = useState('hello', ([$0, $1]) => { msg = $0; setMsg = $1 });
   */
  return () => <div>{msg}</div>;
};
```

### Props

Unis 直接使用 props 会无法获取最新值，所以 unis 提供了 useProps。

```javascript
import { useProps } from "@unis/core";

const App = (p) => {
  let { some } = useProps(p);
  /**
   * Compile to:
   *
   * let { some } = useProps(p, ({ some: $0 }) => { some = $0 });
   */
  return () => <div>{some}</div>;
};
```

### 副作用

Unis 保留了和 React 基本一致的 `useEffect` 和 `useLayoutEffect` ，但 deps 是一个返回数组的函数。

```javascript
import { useEffect } from "@unis/core";

const App = () => {
  useEffect(
    () => {
      // ...
      return () => {
        // 清理...
      };
    },
    () => [] // deps 是一个返回数组的函数
  );

  return () => <div>hello</div>;
};
```

### 自定义 hook

Unis 的自定义 hook ，在有返回值的场景需要搭配 `use` 方法使用，原因则是前面提到的 Callback Reassign 编译策略。自定义 hook 的命名我们约定以小写字母 `u` 开头，目的是用于区分其他函数，同时在 IDE 的提示下更加方便的导入。

```javascript
import { use, useState } from "@unis/core";

// 创建自定义 hook 高阶函数
const uCount = () => {
  let [count, setCount] = useState(0);
  const add = () => setCount(count + 1);
  return () => [count, add];
};

// 通过 `use` 使用 hook
function App() {
  let [count, add] = use(uCount());
  /**
   * Compile to:
   *
   * let [count, add] = use(uCount(), ([$0, $1]) => { count = $0; add = $1 });
   */
  return () => <div onClick={add}>{count}</div>;
}
```

## 特性

### Fragment

```javascript
import { Fragment } from "@unis/core";

function App() {
  return () => (
    <Fragment>
      <div></div>
      <span></span>
    </Fragment>
  );
}
```

### Portal

```javascript
import { createPortal } from "@unis/core";

function App() {
  return () => createPortal(<div></div>, document.body);
}
```

### Context

```javascript
import { createContext } from "@unis/core";
import { render } from "@unis/dom";

const ThemeContext = createContext("light");

function App() {
  let theme = useContext(ThemeContext);

  return () => <div>{theme}</div>;
}

render(
  <ThemeContext.Provider value="dark">
    <App />
  </ThemeContext.Provider>,
  document.querySelector("#root")
);
```

## SSR 服务端渲染

服务端

```javascript
import express from "express";
import { renderToString } from "@unis/dom/server";

const app = express();

app.get("/", (req, res) => {
  const SSR_CONTENT = renderToString(<div>hello world</div>);

  res.send(`
    <html>
      <header>...</header>
      <body>
        <div id="root">${SSR_CONTENT}</div>
      </body>
    </html>
  `);
});
```

客户端

```javascript
import { render } from "@unis/dom";

render(
  <App />,
  document.querySelector("#root"),
  true // true 代表使用 hydrate （水合）进行渲染，复用 server 端的内容。
);
```

## Todo 项目

完整项目请查看

- [packages/unis-example](packages/unis-example) Todo 示例
- [stackbliz](https://stackblitz.com/edit/vitejs-vite-8hn3pz) 试用

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
  - useMemo
  - useEffect
  - useRef
  - useId

## License

MIT @anuoua
