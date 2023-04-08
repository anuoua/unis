import type { PluginOption } from "vite";
import { reassign } from "@callback-reassign/rollup-plugin";
import { unisFns } from "@unis/core";

export function unisPreset(): PluginOption[] {
  return [
    {
      name: "unis-preset",

      enforce: "pre",

      config(config) {
        return {
          esbuild: {
            jsx: "automatic",
            jsxImportSource: "@unis/core",
            ...config.esbuild,
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
