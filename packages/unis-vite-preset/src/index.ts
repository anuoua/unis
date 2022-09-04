import type { PluginOption } from "vite";
import { reassign } from "rollup-plugin-reassign";
import { unisFns } from "@unis/unis";

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
            jsxInject: `import { h, FGMT } from "@unis/unis"`,
          },
        };
      },
    },
    reassign({
      include: ["**/*.(t|j)s?(x)"],
      targetFns: {
        "@unis/unis": unisFns,
      },
    }) as PluginOption,
  ];
}
