# Unis Vite Preset

Unis develop preset for vite.

## Install

```shell
npm add -D @unis/vite-preset
```

## Usage

vite.config.js

```javascript
import { defineConfig } from "vite";
import { unisPreset } from '@unis/vite-preset'

export default defineConfig({
  plugins: [
    unisPreset()
  ]
});
```

