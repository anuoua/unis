import {
  createTextNode,
  createElement,
  createFragment,
  updateElementProperties,
  append,
  removeElements,
  updateTextNode,
} from "./dom";
import {
  EffectScope,
  pauseTracking,
  ReactiveEffect,
  resetTracking,
  shallowReactive,
} from "@vue/reactivity";
import {
  onBeforeMount,
  onBeforeUpdate,
  onErrorCaptured,
  onRenderTracked,
  onRenderTriggered,
  onUnmounted,
  onUpdated,
} from "./life";
import { Fragment, Teleport, formatChildren } from "./h";
import { SchedulerJob } from "./schedule";
import { isFun, rEach } from "./utils";
import { addToQueue } from "./schedule";
import { updateChildren } from "./updateChildren";

export type VodeType = Symbol | Function | string;

export type ParentVode =
  | ElementVode
  | ComponentVode
  | FragmentVode
  | TeleportVode;

export type Vode = TextVode | ParentVode;

export interface VodeInterface {
  depth: number;
  index: number;
  isMounted: boolean;
  type: VodeType;
  props?: any;
  children: Vode[] | null;
  el: Text | DocumentFragment | Element;
  parentVode: Vode;
  create: (parentVode: ParentVode, index: number) => void;
  patch: (...params: any[]) => void;
  getContainerEl?: () => Element;
  mount: () => void;
}

let currentComponentVode: ComponentVode | null = null;

export const TEXT = Symbol("text");

// export function walkVodesDeep(vodes: Vode[], handler: (vode: Vode) => unknown) {
//   for (const vode of vodes) {
//     handler(vode);
//     walkVodesDeep(vode.children, handler);
//   }
// }

export function walkVodesLayer(
  vodes: Vode[],
  handler: (vode: Vode) => unknown
) {
  let next: Vode[] = [];
  for (const vode of vodes) {
    handler(vode);
    next = next.concat(vode.children);
  }
  next.length > 0 && walkVodesLayer(next, handler);
}

export function createCommon(
  this: Vode,
  parentVode: ParentVode,
  index: number
) {
  this.index = index;
  this.parentVode = parentVode;
  this.depth = parentVode.depth + 1;
}

export function findParent(vode: Vode, condition: (vode: Vode) => boolean) {
  while ((vode = vode.parentVode)) {
    if (condition(vode) === true) return vode;
  }
}

export function getCurrentComponentVode() {
  return currentComponentVode;
}

export function setCurrentComponentVode(vode: ComponentVode | null) {
  currentComponentVode = vode;
}

export function getVodesEls(vodes: Vode[]): Node[] {
  let results: Node[] = [];
  for (const vode of vodes) {
    if (vode instanceof ElementVode || vode instanceof TextVode) {
      results.push(vode.el);
    } else if (vode instanceof TeleportVode) {
      continue;
    } else {
      results = results.concat(getVodesEls(vode.children));
    }
  }
  return results;
}

export class TextVode implements VodeInterface {
  public depth!: number;
  public index!: number;
  public el!: Text;
  public parentVode!: ParentVode;
  public type = TEXT;
  public children: Vode[] = [];
  public isMounted = false;

  constructor(public props: { nodeValue: string }) {}

  create(parentVode: ParentVode, index = 0) {
    createCommon.bind(this)(parentVode, index);
    this.el = createTextNode(this.props.nodeValue);
  }

  patch(newVode: TextVode) {
    updateTextNode(this.el, this.props, newVode.props);
    this.index = newVode.index;
    this.props = newVode.props;
  }

  mount() {
    append(this.parentVode.el, this.el);
  }
}

export class ElementVode implements VodeInterface {
  public depth!: number;
  public index!: number;
  public el!: Element;
  public parentVode!: ParentVode;
  public isMounted = false;
  public isSVG = false;

  constructor(public type: string, public props: any, public children: Vode[]) {
    if (type === "svg") this.isSVG = true;
  }

  create(parentVode: ParentVode, index = 0) {
    createCommon.bind(this)(parentVode, index);
    this.isSVG = this.isSVG || Boolean((parentVode as ElementVode).isSVG);
    this.el = createElement(this.type, this.props, this.isSVG);
    this.children.forEach((child, index) => {
      child.create(this, index);
      child.mount();
    });
  }

  mount() {
    append(this.parentVode.el, this.el);
    this.updateRef();
  }

  patch(newVode: ElementVode) {
    updateElementProperties(this.el, this.props, newVode.props, this.isSVG);
    this.index = newVode.index;
    this.props = newVode.props;
    this.updateRef();
    updateChildren(this.children, newVode.children, this);
  }

  updateRef() {
    if (this.props.ref) this.props.ref.value = this.el;
  }

  getContainerEl(): Element {
    return this.el;
  }
}

export class FragmentVode implements VodeInterface {
  public depth!: number;
  public index!: number;
  public el!: DocumentFragment;
  public parentVode!: ParentVode;
  public type = Fragment;
  public isMounted = false;

  constructor(public props: any, public children: Vode[]) {}

  create(parentVode: ParentVode, index = 0) {
    createCommon.bind(this)(parentVode, index);
    this.el = createFragment();
    this.children.forEach((child, index) => {
      child.create(this, index);
      child.mount();
    });
  }

  mount() {
    append(this.parentVode.el, this.el);
  }

  patch(newVode: FragmentVode) {
    this.index = newVode.index;
    this.props = newVode.props;
    updateChildren(this.children, newVode.children, this);
  }

  getContainerEl(): Element {
    return this.parentVode.getContainerEl();
  }
}

export class TeleportVode implements VodeInterface {
  public depth!: number;
  public index!: number;
  public type = Teleport;
  public parentVode!: ParentVode;
  public isMounted = false;
  public el!: DocumentFragment;

  constructor(public props: { to: Element }, public children: Vode[]) {}

  create(parentVode: ParentVode, index = 0) {
    createCommon.bind(this)(parentVode, index);
    this.el = createFragment();
    this.children.forEach((child, index) => {
      child.create(this, index);
      child.mount();
    });
  }

  mount() {
    append(this.getContainerEl(), this.el);
  }

  unmount() {
    removeElements(getVodesEls(this.children));
    this.isMounted = false;
  }

  patch(newVode: TeleportVode) {
    this.index = newVode.index;
    this.props = newVode.props;
    updateChildren(this.children, newVode.children, this);
  }

  getContainerEl(): Element {
    return this.props.to;
  }
}

export class ComponentVode implements VodeInterface {
  public depth!: number;
  public index!: number;
  public el!: DocumentFragment;
  public children: Vode[] = [];
  public parentVode!: ParentVode;
  public isMounted = false;
  public isUpdating = false;
  public isSuspending = false;
  public passProps: any;
  public passSlots: any;
  public renderFn!: Function;
  public life: { [index: string]: any[] } = {};
  public effectScope!: EffectScope;
  public updateEffect!: ReactiveEffect;

  constructor(public type: Function, public props: any, public slots: Vode[]) {
    this.update = this.update.bind(this);
  }

  create(parentVode: ParentVode, index = 0) {
    createCommon.bind(this)(parentVode, index);
    this.el = createFragment();
    this.renderFn = this.type;

    if (!this.setup()) return;
    this.createChildren();
  }

  createChildren() {
    this.children.forEach((child, index) => {
      child.create(this, index);
      child.mount();
    });
  }

  resume() {
    if (!this.isMounted || !this.setup()) return;
    this.createChildren();
  }

  setup() {
    try {
      const effectScope = (this.effectScope = new EffectScope());

      effectScope.run(() => {
        let job: SchedulerJob;
        const effect = (this.updateEffect = new ReactiveEffect(
          () => {
            if (this.isMounted) return this.update(job.isFirst);
            let child;
            let childOrRenderFn;
            let catchedError;
            pauseTracking();
            setCurrentComponentVode(this);
            this.passSlots = shallowReactive(this.slots) as Vode[];
            this.passProps = shallowReactive({
              ...this.props,
              children:
                this.passSlots.length === 1
                  ? this.passSlots[0]
                  : this.passSlots,
            });
            try {
              childOrRenderFn = child = this.type(this.passProps);
            } catch (e: any) {
              catchedError = e;
            }
            setCurrentComponentVode(null);
            resetTracking();
            if (catchedError) throw catchedError;
            this.callLife(onBeforeMount.name);
            if (isFun(childOrRenderFn)) {
              this.renderFn = childOrRenderFn;
              child = this.renderFn();
            } else {
              // if is react function style comp, trigger track manully
              [{ ...this.passProps }, [...this.passSlots]];
            }
            this.children = formatChildren(child);
          },
          () => this.nextTickUpdate(job)
        ));
        effect.onTrack = (event) => this.callLife(onRenderTracked.name, event);
        effect.onTrigger = (event) =>
          this.callLife(onRenderTriggered.name, event);
        job = effect.run = effect.run.bind(effect);
        job.id = this.depth;
        job();
      });
      return true;
    } catch (e: any) {
      if (e instanceof Promise) {
        this.isSuspending = true;
        e.then(() => {
          this.isSuspending = false;
          this.resume();
        }).catch(() => {
          this.isSuspending = false;
        });
      }
      this.effectScope.stop();
      this.life = {};
      this.throwCapturedError(e);
      return false;
    }
  }

  nextTickUpdate(job?: SchedulerJob) {
    addToQueue(job ?? this.updateEffect.run);
  }

  forceUpdate() {
    addToQueue(this.updateEffect.run, true);
  }

  mount() {
    append(this.parentVode.el, this.el);
  }

  unmount() {
    this.isMounted = false;
    this.effectScope.stop();
    this.callLife(onUnmounted.name);
  }

  update(isRootUpdate = false) {
    this.callLife(onBeforeUpdate.name);
    this.isUpdating = true;

    const componentList: ComponentVode[] = [];

    walkVodesLayer([this], (vode: Vode) => {
      if (vode instanceof ComponentVode) componentList.push(vode);
    });

    let newChild;
    try {
      newChild = this.renderFn(this.passProps);
    } catch (e: any) {
      newChild = null as any;
      this.throwCapturedError(e);
    }
    updateChildren(this.children, formatChildren(newChild), this);

    // wait for all updated
    if (isRootUpdate) {
      addToQueue(() => {
        rEach(componentList, (comp: ComponentVode) => {
          comp.isMounted && comp.isUpdating && comp.callLife(onUpdated.name);
          comp.isUpdating = false;
        });
      });
    }
  }

  patch(newVode: ComponentVode) {
    this.index = newVode.index;
    this.props = newVode.props;
    this.slots = newVode.slots;
    Object.assign(this.passProps, newVode.props);
    Object.assign(this.passSlots, newVode.slots);
  }

  getContainerEl(): Element {
    return this.parentVode.getContainerEl();
  }

  callLife(key: string, ...params: any[]) {
    for (const callback of this.life[key] ?? []) {
      callback(...params);
    }
  }

  throwCapturedError(e: any) {
    let vode: Vode = this;

    while ((vode = vode.parentVode)) {
      if (vode instanceof ComponentVode) {
        for (const callback of vode.life[onErrorCaptured.name] ?? []) {
          if (callback(e, vode) === false) return false;
        }
      }
    }
    /* istanbul ignore next */
    if (e instanceof Error) throw e;
    /* istanbul ignore next */
    console.error(e);
  }
}
