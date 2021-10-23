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
import {
  ParentVode,
  SchedulerJob,
  VodeInterface,
  WalkedVodes,
  TEXT,
  Vode,
} from "./type";
import { isFun } from "./utils";
import { addToQueue, nextTick } from "./schedule";
import { updateChildren } from "./updateChildren";

const getWalkedVodesGen = ({ isComponent = false, isTeleport = false } = {}) =>
  function (this: ParentVode): WalkedVodes {
    return this.children.reduce(
      (pre, cur) => ({
        componentList: pre.componentList.concat(
          cur.getWalkedVodes().componentList
        ),
        teleportList: pre.teleportList.concat(
          cur.getWalkedVodes().teleportList
        ),
      }),
      {
        componentList: isComponent ? [this] : [],
        teleportList: isTeleport ? [this] : [],
      } as WalkedVodes
    );
  };

export class TextVode implements VodeInterface {
  public depth!: number;
  public el!: Text;
  public parentVode!: ParentVode;
  public type = TEXT;
  public children = null;
  public isMounted = false;

  constructor(public props: { nodeValue: string }) {}

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
    this.isMounted = true;
  }

  getEntityEls() {
    return [this.el];
  }

  getWalkedVodes() {
    return {
      componentList: [],
      teleportList: [],
    } as WalkedVodes;
  }
}

export class ElementVode implements VodeInterface {
  public depth!: number;
  public el!: HTMLElement | SVGElement;
  public parentVode!: ParentVode;
  public isMounted = false;
  public isSVG = false;
  public getWalkedVodes: () => WalkedVodes;

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
    this.isMounted = true;
  }

  patch(newVode: ElementVode) {
    updateElementProperties(this.el, this.props, newVode.props, this.isSVG);
    this.updateRef();
    updateChildren(this.children, newVode.children, this);
  }

  updateRef() {
    // memory leak when unmounted ?
    if (this.props.ref) this.props.ref.value = this.el;
  }

  getEntityEls() {
    return [this.el];
  }

  getContainerEl(): Node {
    return this.el;
  }
}

export class FragmentVode implements VodeInterface {
  public depth!: number;
  public el!: DocumentFragment;
  public parentVode!: ParentVode;
  public type = Fragment;
  public isMounted = false;
  public getWalkedVodes: () => WalkedVodes;

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
    this.isMounted = true;
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

  getContainerEl(): Node {
    return this.parentVode.getContainerEl();
  }
}

export class TeleportVode implements VodeInterface {
  public depth!: number;
  public type = Teleport;
  public el!: HTMLElement;
  public parentVode!: ParentVode;
  public isMounted = false;
  public getWalkedVodes: () => WalkedVodes;

  constructor(public props: { to: HTMLElement }, public children: Vode[]) {
    this.getWalkedVodes = getWalkedVodesGen({
      isTeleport: true,
    });
  }

  create(parentVode: ParentVode) {
    this.parentVode = parentVode;
    this.el = this.props.to;
    this.depth = parentVode.depth + 1;
    for (const child of this.children) {
      child.create(this);
      child.mount();
    }
  }

  mount() {
    this.isMounted = true;
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
    return this.children.reduce(
      (pre, cur) => pre.concat(cur.getEntityEls()),
      [] as Node[]
    );
  }

  getContainerEl(): Node {
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
  public getWalkedVodes: () => WalkedVodes;

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

    const job = this.update as SchedulerJob;
    job.id = this.depth;

    const effectScope = (this.effectScope = new EffectScope());

    effectScope.run(() => {
      new ReactiveEffect(
        () => {
          let child: Vode;
          this.passSlots = shallowReactive(this.slots) as Vode[];
          this.passProps = shallowReactive({
            ...this.props,
            children: this.passSlots,
          });
          pauseTracking();
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
        () => {
          addToQueue(job);
        }
      ).run();
    });

    for (const child of this.children) {
      child.create(this);
      child.mount();
    }
  }

  mount() {
    append(this.parentVode.el, this.el);
    this.isMounted = true;
  }

  unmount() {
    this.isMounted = false;
    this.effectScope.stop();
    this.callLife(onUnmounted.name);
  }

  update(first = false) {
    this.callLife(onBeforeUpdate.name);
    this.isUpdating = true;

    const comps = this.getWalkedVodes().componentList;

    const newChild = this.renderFn(this.passProps);
    updateChildren(this.children, formatChildren(newChild), this);

    // wait for all updated
    if (first) {
      nextTick(() => {
        let comp: ComponentVode | undefined;
        while ((comp = comps.pop())) {
          comp.isMounted && comp.isUpdating && comp.callLife(onUpdated.name);
          comp.isUpdating = false;
        }
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

  getContainerEl(): Node {
    return this.parentVode.getContainerEl();
  }

  callLife(key: string, ...params: any[]) {
    if (!this.life[key]) return;
    for (const callback of this.life[key]) {
      callback(...params);
    }
  }
}
