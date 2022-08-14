# Unis Transition

Transition component for unis inspired by  `React Transition Group`.

## Install

```shell
npm i @unis/transition
```

## Usage

```javascript
import { useState } from '@unis/unis';
import { CSSTransition, TransitionGroup } from '@unis/transition'

const App = () => {
  let [visible, setVisible] = useState(false);

  const handleToggle = () => {
    setVisible(!visible);
  }

  return () => (
    <Fragment>
      <button onClick={handleToggle}>toggle</button>
      <CSSTransition in={visible} timeout={400} classnames="fade">
        <div>
          hello
        </div>
      </CSSTransition>
    </Fragment>
  )
}
```

```css
.fade-appear {
  opacity: 0;
}

.fade-appear-active {
  opacity: 1;
  transition: all 0.4s ease;
}

.fade-appear-done {
  opacity: 1;
}

.fade-enter {
  opacity: 0;
}

.fade-enter-active {
  opacity: 1;
  transition: all 0.4s ease;
}

.fade-enter-done {
  opacity: 1;
}

.fade-exit {
  opacity: 1;
}

.fade-exit-active {
  opacity: 0;
  transition: all 0.4s ease;
}

.fade-exit-done {
  opacity: 0;
}
```

Online [demo](https://stackblitz.com/edit/vitejs-vite-4cfy2b) here

## CSSTransition

Component API as close to `React Transition Group` as possible.

### in

Show the component.

type: `boolean`
default: `false`

### mountOnEnter

By default the child component is mounted on the first `in={true}`. you can set `mountOnEnter={false}` child component will be mounted immediately with parent component.

type: `boolean`
default: `true`

### unmountOnExit

By default the child component is unmounted after it finishes exiting. you can set `unmountOnExit={false}` child component stays mounted after it reaches the 'exited' state.

type: `boolean`
default: `true`

### classNames

type:

```typescript
string | {
  appear?: string,
  appearActive?: string,
  appearDone?: string,
  enter?: string,
  enterActive?: string,
  enterDone?: string,
  exit?: string,
  exitActive?: string,
  exitDone?: string,
}
```

default: `''`

for example `classNames="fade"` it will apply classes below

- `fade-appear`, `fade-appear-active`, `fade-appear-done`
- `fade-enter`, `fade-enter-active`, `fade-enter-done`
- `fade-exit`, `fade-exit-active`, `fade-exit-done`

### onEnter

Callback fired immediately after the 'enter' or 'appear' class is applied.

type: `Function(node: HtmlElement)`

### onEntering

Callback fired immediately after the 'enter-active' or 'appear-active' class is applied.

type: `Function(node: HtmlElement)`

### onEntered

Callback fired immediately after the 'enter' or 'appear' classes are removed and the done class is added to the DOM node.

type: `Function(node: HtmlElement)`

### onExit

Callback fired immediately after the 'exit' class is applied.

type: `Function(node: HtmlElement)`

### onExiting

Callback fired immediately after the 'exit-active' is applied.

type: `Function(node: HtmlElement)`

### onExited

Callback fired immediately after the 'exit' classes are removed and the exit-done class is added to the DOM node.

type: `Function(node?: HtmlElement)`

## TransitionGroup

Easy to use, just wrap on `CSSTransition` with key.

```javascript
<TransitionGroup>
  {list.map((item, index) => (
    <CSSTransition key={item.id} timeout={400} classNames="fade">
      <div>{item.name}</div>
    </CSSTransition>
  ))}
</TransitionGroup>
```

