# Unis Router

Router for unis, inspire by [React Router V6](https://github.com/remix-run/react-router).

## Install

```shell
npm i @unis/router
```

## Usage

Unis router's api is partial same as React Router V6.

example

```javascript
import { BrowserRouter, Routes, Route, Outlet } from '@unis/router'

const Dashboard = () => {
  
  return () => (
    <div>
      dashboard
      <Outlet /> // hello
    </div>
  )
}

const App = () => {

  return () => (
    <div>
      <header>App</header>
      <Routes path="dashboard" element={<Dashboard />}>
        <Route path="hello" element={<div>hello</div>} />
      </Routes>
    </div>
  )
}

render(
  <BrowserRouter basename="admin">
    <App />
  </BrowserRouter>, document.querySelector('#app'))
```


