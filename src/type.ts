import type { PropsWithChildren } from "react";
import type { Ref } from "@vue/reactivity";
import {
  ComponentVode,
  FragmentVode,
  ElementVode,
  TeleportVode,
  TextVode,
} from "./vode";

export const TEXT = Symbol("text");

export type VodeType = Symbol | Function | string;

export interface WalkedVodes {
  componentList: ComponentVode[];
  teleportList: TeleportVode[];
}

export interface VodeInterface {
  depth: number;
  isMounted: boolean;
  type: VodeType;
  props?: any;
  children: Vode[] | null;
  el: Text | DocumentFragment | HTMLElement | SVGElement;
  parentVode: Vode;
  create: (parentVode: ParentVode) => void;
  patch: (...params: any[]) => void;
  getEntityEls: () => Node[];
  getContainerEl?: () => Node;
  getWalkedVodes: () => WalkedVodes;
  mount: () => void;
}

export type ParentVode =
  | ElementVode
  | ComponentVode
  | FragmentVode
  | TeleportVode;

export type Vode = TextVode | ParentVode;

export interface SchedulerJob extends Function {
  id?: number;
}

export type UFC<P = {}> = {
  (props: PropsWithChildren<P> & { ref?: Ref<any> }): JSX.Element;
};
