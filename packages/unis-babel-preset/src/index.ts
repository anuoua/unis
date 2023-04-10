import { unisFns } from "@unis/core";

export function unisPreset() {
  return {
    plugins: [
      "@babel/plugin-syntax-jsx",
      [
        "@babel/plugin-transform-react-jsx",
        {
          runtime: "automatic",
          importSource: "@unis/core",
        },
      ],
      [
        "@callback-reassign/babel-plugin",
        {
          targetFns: {
            "@unis/core": unisFns,
          },
        },
      ],
    ],
  };
}
