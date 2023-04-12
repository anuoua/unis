import { unisFns } from "@unis/core";
// @ts-ignore
import syntaxJsx from "@babel/plugin-syntax-jsx";
// @ts-ignore
import transformReactJsx from "@babel/plugin-transform-react-jsx";
import reassign from "@callback-reassign/babel-plugin";

export default function unisPreset() {
  return {
    plugins: [
      syntaxJsx,
      [
        transformReactJsx,
        {
          runtime: "automatic",
          importSource: "@unis/core",
        },
      ],
      [
        reassign,
        {
          targetFns: {
            "@unis/core": unisFns,
          },
        },
      ],
    ],
  };
}
