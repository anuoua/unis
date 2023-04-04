import type { PluginOption } from "vite";
import { reassign } from "rollup-plugin-reassign";
import { unisFns } from "@unis/core";

export function unisPreset(): PluginOption[] {
  return [
    {
      name: "unis-preset",

      enforce: "pre",

      config(config) {
        return {
          esbuild: {
            jsxFactory: "h",
            jsxFragment: "FGMT",
            jsxInject: `import { h, FGMT } from "@unis/core"`,
          },
        };
      },
    },
    reassign({
      include: ["**/*.(t|j)s?(x)"],
      targetFns: {
        "@unis/core": unisFns,
      },
    }) as PluginOption,
  ];
}
