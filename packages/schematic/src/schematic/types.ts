import type { SymbolTemplateContext } from "./symbolTemplateModel";

/** Display and interaction snapping interval. */
export const GRID_SIZE = 10;
/** Fixed design unit for symbol dimensions, independent of the snapping grid. */
export const SYMBOL_GRID_SIZE = 20;

export type ComponentType =
  | "gnd"
  | "vdd"
  | "antenna"
  | "resistor"
  | "capacitor"
  | "inductor"
  | "diode"
  | "impedance"
  | "voltageSource"
  | "currentSource"
  | "battery"
  | "iprobe"
  | "diffProbe"
  | "plus"
  | "multiply"
  | "adc"
  | "dac"
  | "vcvs"
  | "vccs"
  | "cccs"
  | "ccvs"
  | "opAmp"
  | "ota"
  | "comparator"
  | "slicer"
  | "diffAmp"
  | "diffOta"
  | "diffComparator"
  | "idealGm"
  | "inverter"
  | "digitalBuffer"
  | "and"
  | "nand"
  | "or"
  | "nor"
  | "xor"
  | "xnor"
  | "dff"
  | "analogBuffer"
  | "amp"
  | "gm"
  | "nmos"
  | "pmos"
  | "npn"
  | "pnp"
  | "switch"
  | "spntSwitch"
  | "transmissionGate"
  | "rectangle"
  | "triangle"
  | "integrator"
  | "differentiator"
  | "delay"
  | "filter"
  | "annotation";

export type PinRole =
  | "in"
  | "p"
  | "n"
  | "out"
  | "outP"
  | "outN"
  | "ctrlP"
  | "ctrlN"
  | "senseP"
  | "senseN"
  | "clk"
  | "set"
  | "reset"
  | "drain"
  | "gate"
  | "source"
  | "bulk"
  | "collector"
  | "base"
  | "emitter"
  | "gnd"
  | "io";

export type OperatorPinMode = "positive" | "negative" | "output";
export type GainPolarity = "default" | "positive" | "negative";

export type TerminalClass = "annotation" | "oneTerminal" | "twoTerminal" | "threeTerminal" | "fourTerminal" | "fiveTerminal" | "dynamic";
export type ComponentVariantId = string;
export type ComponentNameFormat = "schematic" | "indexed" | "literal";

export interface Point {
  x: number;
  y: number;
}

export interface PinDef {
  id: string;
  label: string;
  role: PinRole;
  x: number;
  y: number;
}

export interface ComponentVariantDef {
  id: ComponentVariantId;
  label: string;
  terminalClass: TerminalClass;
  size: { width: number; height: number };
  pins: PinDef[];
  symbol: string;
  valueLabel?: string;
  valuePlaceholder?: string;
}

export interface ComponentDef {
  /** Scale of resolved geometry relative to the catalog artwork. */
  geometryScale?: number;
  type: ComponentType;
  label: string;
  hotLabel: string;
  aliases?: readonly string[];
  terminalClass: TerminalClass;
  valuePrefix?: string;
  valueKey?: string;
  valueLabel?: string;
  valuePlaceholder?: string;
  valueUnit?: string;
  defaultValues?: Record<string, string>;
  defaultLabelVisible?: boolean;
  nameFormat?: ComponentNameFormat;
  centeredRefLabel?: boolean;
  bodyPolygon?: readonly Point[];
  editableGainPolarity?: boolean;
  editablePinVisibility?: boolean;
  editablePinVisibilityIds?: string[];
  editablePinMode?: boolean;
  size: { width: number; height: number };
  pins: PinDef[];
  symbol: string;
  defaultVariantId?: ComponentVariantId;
  variantId?: ComponentVariantId;
  variantLabel?: string;
  variants?: ComponentVariantDef[];
}

export interface ComponentInstance {
  scale?: import("./componentScaleModel").ComponentScale;
  id: string;
  type: ComponentType;
  variantId?: ComponentVariantId;
  ref: string;
  x: number;
  y: number;
  rotation: number;
  mirrored: boolean;
  values: Record<string, string>;
  appearance?: ComponentAppearance;
  temporarilyDeleted?: boolean;
}

export interface ComponentAppearance {
  color?: string;
}

export type WireRouteMode = "orthogonal" | "freeAngle";

export interface Wire {
  id: string;
  points: Point[];
  routeMode: WireRouteMode;
  appearance?: WireAppearance;
  temporarilyDeleted?: boolean;
}

export type WireVariant = "signal" | "wide";
export type WireEndpointMarker = "default" | "arrow" | "circle";
export type WireLineWidth = "a" | "2a";

export interface WireAppearance {
  variant: WireVariant;
  color?: string;
  lineWidth?: WireLineWidth;
  startMarker?: WireEndpointMarker;
  endMarker?: WireEndpointMarker;
  digitalSlash?: boolean;
  digitalLabel?: string;
}

export interface NetLabelAttachment {
  /** Empty when the label is floating and therefore electrically inactive. */
  wireId: string;
  point: Point;
}

export interface NetLabel {
  id: string;
  name: string;
  attachment: NetLabelAttachment;
}

export type SchematicNoteFormat = "plain" | "markdown";

export interface SchematicNote {
  rotation?: 0 | 90 | 180 | 270;
  id: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  format: SchematicNoteFormat;
  text: string;
  /** Undefined uses the default fill; null explicitly disables the fill. */
  backgroundColor?: string | null;
  textColor?: string;
  fontSizePx?: number;
}

export interface JunctionAppearance {
  point: Point;
  color: string;
}

/** Physical endpoint identities. Equal coordinates alone never join these nodes. */
export interface SchematicConnections {
  /** One node identity for each vertex in a wire's existing points array. */
  wires: Record<string, string[]>;
  /** Component and stable pin identities, independent of symbol presentation. */
  pins: Record<string, Record<string, string>>;
}

export type InductorCouplingLabelMode = "coefficient" | "ratio";

export interface InductorCoupling {
  id: string;
  inductorAId: string;
  inductorBId: string;
  coefficient: string;
  coefficientAuto: boolean;
  labelMode: InductorCouplingLabelMode;
  showLabel: boolean;
  showArc: boolean;
  showCore: boolean;
  arcFlipped: boolean;
  appearance?: ComponentAppearance;
}

/** Durable schematic content. */
export interface SchematicContent extends SymbolTemplateContext {
  components: ComponentInstance[];
  wires: Wire[];
  connections: SchematicConnections;
  inductorCouplings?: InductorCoupling[];
  junctionAppearances: JunctionAppearance[];
  netLabels: NetLabel[];
  notes: SchematicNote[];
}

/** Runtime document shape. `junctions` is derived and omitted from durable content. */
export interface SchematicDocument extends SchematicContent {
  junctions: Point[];
}

/** Per-mounted-view state. It is not part of durable schematic content. */
export interface SchematicViewState {
  zoom: number;
  translate: Point;
  presentationMode: boolean;
}

export interface NetlistPin {
  componentId: string;
  componentRef: string;
  componentType: ComponentType;
  pinId: string;
  pinRole: PinRole;
  point: Point;
  netId: string;
}

export interface NetlistComponent {
  instance: ComponentInstance;
  def: ComponentDef;
  pins: Record<string, string>;
}

export interface ExtractedNetlist {
  nets: Map<string, Point[]>;
  pins: NetlistPin[];
  components: NetlistComponent[];
  diagnostics: string[];
}

export interface AnalysisPortSelection {
  inputP: string;
  inputN: string;
  outputP: string;
  outputN: string;
}

export interface AnalysisResult {
  ok: boolean;
  diagnostics: string[];
  transferTex?: string;
  transferExpression?: string;
  inputImpedanceTex?: string;
  inputImpedanceExpression?: string;
  outputImpedanceTex?: string;
  outputImpedanceExpression?: string;
  equations?: string[];
}
