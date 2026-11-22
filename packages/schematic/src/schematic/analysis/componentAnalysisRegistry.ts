import type { ComponentInstance, ComponentType } from "../types";

export type AnalysisModel =
  | "ground"
  | "resistor"
  | "capacitor"
  | "inductor"
  | "impedance"
  | "voltageSource"
  | "currentSource"
  | "vcvs"
  | "vccs"
  | "cccs"
  | "ccvs"
  | "opAmp"
  | "ota"
  | "diffAmp"
  | "diffOta"
  | "idealGm"
  | "mosfet"
  | "bjt"
  | "blackBox"
  | "annotation";

interface ComponentAnalysisRegistration {
  model: AnalysisModel;
  variants?: Readonly<Record<string, AnalysisModel>>;
}

export const COMPONENT_ANALYSIS_REGISTRY = {
  gnd: { model: "ground" },
  vdd: { model: "annotation" },
  antenna: { model: "blackBox" },
  resistor: { model: "resistor" },
  capacitor: { model: "capacitor" },
  inductor: { model: "inductor" },
  diode: { model: "blackBox" },
  impedance: { model: "impedance" },
  voltageSource: { model: "voltageSource" },
  currentSource: { model: "currentSource" },
  battery: { model: "voltageSource" },
  iprobe: { model: "annotation" },
  diffProbe: { model: "annotation" },
  plus: { model: "annotation" },
  multiply: { model: "annotation" },
  adc: { model: "annotation" },
  dac: { model: "annotation" },
  vcvs: { model: "vcvs" },
  vccs: { model: "vccs" },
  cccs: { model: "cccs" },
  ccvs: { model: "ccvs" },
  opAmp: { model: "opAmp" },
  ota: { model: "ota" },
  comparator: { model: "annotation" },
  slicer: { model: "annotation" },
  diffAmp: { model: "diffAmp" },
  diffOta: { model: "diffOta" },
  diffComparator: { model: "annotation" },
  idealGm: { model: "idealGm" },
  inverter: { model: "annotation" },
  digitalBuffer: { model: "annotation" },
  and: { model: "annotation" },
  nand: { model: "annotation" },
  or: { model: "annotation" },
  nor: { model: "annotation" },
  xor: { model: "annotation" },
  xnor: { model: "annotation" },
  dff: { model: "annotation" },
  analogBuffer: { model: "annotation" },
  amp: { model: "annotation" },
  gm: { model: "annotation" },
  nmos: { model: "mosfet" },
  pmos: { model: "mosfet" },
  npn: { model: "bjt" },
  pnp: { model: "bjt" },
  switch: { model: "annotation" },
  spntSwitch: { model: "annotation" },
  transmissionGate: { model: "blackBox" },
  rectangle: { model: "blackBox" },
  triangle: { model: "blackBox" },
  integrator: { model: "blackBox" },
  differentiator: { model: "blackBox" },
  delay: { model: "blackBox" },
  filter: { model: "blackBox" },
  annotation: { model: "annotation" }
} as const satisfies Record<ComponentType, ComponentAnalysisRegistration>;

export function resolveComponentAnalysisModel(
  instance: Pick<ComponentInstance, "type" | "variantId">
): AnalysisModel {
  const registration: ComponentAnalysisRegistration = COMPONENT_ANALYSIS_REGISTRY[instance.type];
  return (instance.variantId ? registration.variants?.[instance.variantId] : undefined) ?? registration.model;
}
