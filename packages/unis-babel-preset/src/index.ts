import { unisFns } from "@unis/core";
import reassign from "@callback-reassign/babel-plugin";
// @ts-ignore
import syntaxJsx from "@babel/plugin-syntax-jsx";
// @ts-ignore
import transformReactJsx from "@babel/plugin-transform-react-jsx";

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
