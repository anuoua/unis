import {
  createTextNode,
  createElement,
  createFragment,
  updateElementProperties,
  append,
  removeElements,
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
  onUnmounted,
  onUpdated,
  setCurrentComponentVode,
} from "./life";
import { Fragment, Teleport, formatChildren } from "./h";
import { SchedulerJob } from "./schedule";
import { isFun, rEach } from "./utils";
import { addToQueue } from "./schedule";
import { updateChildren } from "./updateChildren";

export const TEXT = Symbol("text");

export type VodeType = Symbol | Function | string;

export type ParentVode =
  | ElementVode
  | ComponentVode
  | FragmentVode
  | TeleportVode;

export type Vode = TextVode | ParentVode;

export interface VodeInterface {
  depth: number;
  isMounted: boolean;
  type: VodeType;
  props?: any;
  children: Vode[] | null;
  el: Text | DocumentFragment | Element;
  parentVode: Vode;
  create: (parentVode: ParentVode) => void;
  patch: (...params: any[]) => void;
  getEntityEls: () => Node[];
  getContainerEl?: () => Element;
  getWalkedVodes: WalkedVodesFn;
  mount: () => void;
}

export interface WalkedVodes {
  componentList: ComponentVode[];
  teleportList: TeleportVode[];
}

export type WalkedVodesFn = (visitor?: (vode: Vode) => void) => WalkedVodes;

function getWalkedVodesGen({ isComponent = false, isTeleport = false } = {}) {
  return function (this: Vode, visitor?: (vode: Vode) => void): WalkedVodes {
    visitor?.(this);
    return (this.children ?? []).reduce(
      (pre, cur) => ({
        componentList: pre.componentList.concat(
          cur.getWalkedVodes(visitor).componentList
        ),
        teleportList: pre.teleportList.concat(
          cur.getWalkedVodes(visitor).teleportList
        ),
      }),
      {
        componentList: isComponent ? [this] : [],
        teleportList: isTeleport ? [this] : [],
      } as WalkedVodes
    );
  };
}

export class TextVode implements VodeInterface {
  public depth!: number;
  public el!: Text;
  public parentVode!: ParentVode;
  public type = TEXT;
  public children = null;
  public isMounted = false;
  public getWalkedVodes: WalkedVodesFn;

  constructor(public props: { nodeValue: string }) {
    this.getWalkedVodes = getWalkedVodesGen();
  }

  create(parentVode: ParentVode) {
    this.parentVode = parentVode;
    this.depth = parentVode.depth + 1;
    this.el = createTextNode(this.props.nodeValue);
  }

  patch(newVode: TextVode) {
    const { nodeValue } = newVode.props;
    if (this.props.nodeValue !== nodeValue) {
      this.props.nodeValue = nodeValue;
      this.el.nodeValue = nodeValue;
    }
  }

  mount() {
    append(this.parentVode.el, this.el);
  }

  getEntityEls() {
    return [this.el];
  }
}

export class ElementVode implements VodeInterface {
  public depth!: number;
  public el!: Element;
  public parentVode!: ParentVode;
  public isMounted = false;
  public isSVG = false;
  public getWalkedVodes: WalkedVodesFn;

  constructor(public type: string, public props: any, public children: Vode[]) {
    if (type === "svg") this.isSVG = true;
    this.getWalkedVodes = getWalkedVodesGen();
  }

  create(parentVode: ParentVode) {
    this.parentVode = parentVode;
    this.isSVG = this.isSVG || Boolean((parentVode as ElementVode).isSVG);
    this.depth = parentVode.depth + 1;
    this.el = createElement(this.type, this.props, this.isSVG);
    for (const child of this.children) {
      child.create(this);
      child.mount();
    }
  }

  mount() {
    append(this.parentVode.el, this.el);
    this.updateRef();
  }

  patch(newVode: ElementVode) {
    updateElementProperties(this.el, this.props, newVode.props, this.isSVG);
    this.updateRef();
    updateChildren(this.children, newVode.children, this);
  }

  updateRef() {
    if (this.props.ref) this.props.ref.value = this.el;
  }

  getEntityEls() {
    return [this.el];
  }

  getContainerEl(): Element {
    return this.el;
  }
}

export class FragmentVode implements VodeInterface {
  public depth!: number;
  public el!: DocumentFragment;
  public parentVode!: ParentVode;
  public type = Fragment;
  public isMounted = false;
  public getWalkedVodes: WalkedVodesFn;

  constructor(public props: any, public children: Vode[]) {
    this.getWalkedVodes = getWalkedVodesGen();
  }

  create(parentVode: ParentVode) {
    this.parentVode = parentVode;
    this.depth = parentVode.depth + 1;
    this.el = createFragment();
    for (const child of this.children) {
      child.create(this);
      child.mount();
    }
  }

  mount() {
    append(this.parentVode.el, this.el);
  }

  patch(newVode: FragmentVode) {
    this.props = newVode.props;
    updateChildren(this.children, newVode.children, this);
  }

  getEntityEls(): Node[] {
    return this.children.reduce(
      (pre, cur) => pre.concat(cur.getEntityEls()),
      [] as Node[]
    );
  }

  getContainerEl(): Element {
    return this.parentVode.getContainerEl();
  }
}

export class TeleportVode implements VodeInterface {
  public depth!: number;
  public type = Teleport;
  public parentVode!: ParentVode;
  public isMounted = false;
  public getWalkedVodes: WalkedVodesFn;
  public el!: DocumentFragment;

  constructor(public props: { to: Element }, public children: Vode[]) {
    this.getWalkedVodes = getWalkedVodesGen({
      isTeleport: true,
    });
  }

  create(parentVode: ParentVode) {
    this.parentVode = parentVode;
    this.el = createFragment();
    this.depth = parentVode.depth + 1;
    for (const child of this.children) {
      child.create(this);
      child.mount();
    }
  }

  mount() {
    append(this.getContainerEl(), this.el);
  }

  unmount() {
    const utilVode = new FragmentVode({}, this.children);
    removeElements(utilVode.getEntityEls());
    this.isMounted = false;
  }

  patch(newVode: TeleportVode) {
    updateChildren(this.children, newVode.children, this);
  }

  getEntityEls(): Node[] {
    return [];
  }

  getContainerEl(): Element {
    return this.props.to;
  }
}

export class ComponentVode implements VodeInterface {
  public depth!: number;
  public el!: DocumentFragment;
  public children!: Vode[];
  public parentVode!: ParentVode;
  public isMounted = false;
  public isUpdating = false;
  public passProps: any;
  public passSlots: any;
  public renderFn!: Function;
  public life: { [index: string]: any[] } = {};
  public effectScope!: EffectScope;
  public updateEffect!: ReactiveEffect;
  public getWalkedVodes: WalkedVodesFn;

  constructor(public type: Function, public props: any, public slots: Vode[]) {
    this.update = this.update.bind(this);
    this.getWalkedVodes = getWalkedVodesGen({
      isComponent: true,
    });
  }

  create(parentVode: ParentVode) {
    this.parentVode = parentVode;
    this.depth = parentVode.depth + 1;
    this.el = createFragment();
    this.renderFn = this.type;

    const effectScope = (this.effectScope = new EffectScope());

    effectScope.run(() => {
      let job: SchedulerJob;
      const effect = (this.updateEffect = new ReactiveEffect(
        () => {
          if (this.isMounted) return this.update(job.isFirst);
          let child: Vode;
          pauseTracking();
          this.passSlots = shallowReactive(this.slots) as Vode[];
          this.passProps = shallowReactive({
            ...this.props,
            children:
              this.passSlots.length === 1 ? this.passSlots[0] : this.passSlots,
          });
          setCurrentComponentVode(this);
          const childOrRenderFn = (child = this.type(this.passProps));
          setCurrentComponentVode(null);
          resetTracking();
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
      job = effect.run = effect.run.bind(effect);
      job.id = this.depth;
      job();
    });

    for (const child of this.children) {
      child.create(this);
      child.mount();
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

    const comps = this.getWalkedVodes().componentList;

    const newChild = this.renderFn(this.passProps);
    updateChildren(this.children, formatChildren(newChild), this);

    // wait for all updated
    if (isRootUpdate) {
      addToQueue(() => {
        rEach(comps, (comp: ComponentVode) => {
          comp.isMounted && comp.isUpdating && comp.callLife(onUpdated.name);
          comp.isUpdating = false;
        });
      });
    }
  }

  patch(newVode: ComponentVode) {
    this.props = newVode.props;
    this.slots = newVode.slots;
    Object.assign(this.passProps, newVode.props);
    Object.assign(this.passSlots, newVode.slots);
  }

  getEntityEls(): Node[] {
    return this.children.reduce(
      (pre, cur) => pre.concat(cur.getEntityEls()),
      [] as Node[]
    );
  }

  getContainerEl(): Element {
    return this.parentVode.getContainerEl();
  }

  callLife(key: string, ...params: any[]) {
    if (!this.life[key]) return;
    for (const callback of this.life[key]) {
      callback(...params);
    }
  }
}
