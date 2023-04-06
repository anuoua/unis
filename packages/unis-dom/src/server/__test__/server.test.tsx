import { expect, it } from "vitest";
import { renderToString } from "..";

it("render to string", () => {
  const App = () => {
    return () => (
      <div className="test">
        <>
          <h1>hello</h1>
          <span style={{ background: "yellow" }}>world</span>
        </>
      </div>
    );
  };

  const result = renderToString(<App />);

  expect(result).toBe(
    '<div class="test"><h1>hello</h1><span style="background: yellow;">world</span></div>'
  );
});
