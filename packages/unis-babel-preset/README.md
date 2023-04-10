# Unis Babel Preset

Unis develop preset for babel.

## Install

```shell
npm add -D @unis/babel-preset
```

## Usage

.babelrc.json or babel.config.js

```javascript
{
  "presets": ["@unis/babel-preset"]
}
```

If you use @babel/preset-env, please use relatively new targets. There is a bug in the babel transformation of destructuring syntax. e.g.

```javascript
{
  "presets": [
    [
      "@babel/preset-env",
      {
        targets: "> 0.25%, not dead",
      }
    ],
    "@unis/babel-preset"
  ]
}
```
