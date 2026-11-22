import { SYMBOL_GRID_SIZE, type ComponentDef, type ComponentInstance, type ComponentType, type ComponentVariantDef, type ComponentVariantId, type PinDef, type TerminalClass } from "./types";
import { componentScale, scaleComponentDefinition } from "./componentScaleModel";
import { DEFAULT_TRIANGLE_SETTINGS, TRIANGLE_VERTICES, triangleSettings, triangleSettingsValues, triangleSize, trianglePinGeometry, triangleVertexPinGeometry } from "./triangleComponentModel";
import {
  boxedComponentPinPoint,
  boxedComponentSize,
  boxedHorizontalPins
} from "./boxedComponentModel";
import {
  DEFAULT_MOS_VIEW_VARIANT_ID,
  MOS_PIN_VIEWS,
  MOS_VIEW_STYLES,
  MOS_THICK_GATE_SYMBOL_SUFFIX,
  mosThickGate,
  mosViewLabel,
  mosViewVariantId
} from "./mosViewModel";
import {
  DEFAULT_RECTANGLE_SETTINGS,
  rectangleDefaultValues,
  rectanglePins,
  rectangleSettings,
  rectangleSize
} from "./rectangleComponentModel";
import {
  DEFAULT_FUNCTION_BLOCK_VIEW,
  DEFAULT_FUNCTION_BLOCK_GAIN,
  FUNCTION_BLOCK_GAIN_VALUE_KEY,
  DELAY_VALUE_KEY,
  defaultDelayValue,
  supportsFunctionBlockGain,
  functionBlockViewOptions,
  isFunctionBlockType,
  resolveFunctionBlockModel,
  type FunctionBlockType
} from "./functionBlockModel";
import {
  isTransistorComponentType,
  symbolWithTransistorCircle,
  transistorCircleVisible
} from "./transistorCircleModel";
import {
  differentialOutputsSame,
  resolveDifferentialOutputPins,
  supportsDifferentialOutputOrder
} from "./differentialOutputModel";
import {
  DEFAULT_LOGIC_GATE_INPUT_COUNT,
  logicGatePins,
  logicGateSize,
  logicGateSymbolId,
  logicGateVariantId,
  logicGateVariants,
  type LogicGateType
} from "./logicGateModel";
import {
  DEFAULT_DFF_SETTINGS,
  DFF_SIZE,
  dffPins,
  dffSettings
} from "./dffModel";
import {
  CONVERTER_BITS_VALUE_KEY,
  DEFAULT_CONVERTER_BITS
} from "./converterModel";
import { componentClockForInstance } from "./clockModel";
import { voltageSourceFieldValue } from "./voltageSourceModel";
import {
  DEFAULT_SPNT_THROW_COUNT, SPNT_POSITION_VALUE_KEY,
  spntPins, spntPosition, spntSize, spntSymbolId, spntThrowCount, spntVariants
} from "./spntSwitchModel";
import {
  TAPPED_INDUCTOR_SIZE,
  PLANAR_INDUCTOR_SIZE,
  isPlanarInductor,
  planarInductorPins,
  inductorTap,
  tappedInductorPins
} from "./inductorModel";

const TWO_TERMINAL_SIZE = { width: 100, height: 56 };
const ONE_TERMINAL_SIZE = { width: 60, height: 52 };
const THREE_TERMINAL_SIZE = { width: 116, height: 92 };
const FOUR_TERMINAL_SIZE = { width: 120, height: 88 };
const DIFFERENTIAL_FOUR_PORT_SIZE = { width: 240, height: 176 };
const INVERTER_SIZE = { width: 100, height: 64 };
const CONVERTER_SIZE = { width: 100, height: 4 * SYMBOL_GRID_SIZE };
const SLICER_SIZE = boxedComponentSize(2, 2);
const TRANSMISSION_GATE_SIZE = boxedComponentSize(2, 2);
const MOS_SIZE = { width: 100, height: 100 };
const OPERATOR_SIZE = { width: 4 * SYMBOL_GRID_SIZE, height: 4 * SYMBOL_GRID_SIZE };
const ANNOTATION_SIZE = { width: 180, height: 30 };
const DEFAULT_RECTANGLE_SIZE = rectangleSize(DEFAULT_RECTANGLE_SETTINGS);
const DEFAULT_RECTANGLE_PINS = rectanglePins(DEFAULT_RECTANGLE_SETTINGS);

const TWO_TERMINAL_PINS: PinDef[] = [
  { id: "p", label: "+", role: "p", x: -40, y: 0 },
  { id: "n", label: "-", role: "n", x: 40, y: 0 }
];

const DIODE_PINS: PinDef[] = [
  { id: "a", label: "A", role: "p", x: -40, y: 0 },
  { id: "k", label: "K", role: "n", x: 40, y: 0 }
];

const GROUND_PINS: PinDef[] = [{ id: "g", label: "0", role: "gnd", x: 0, y: -20 }];
const VDD_PINS: PinDef[] = [{ id: "vdd", label: "VDD", role: "p", x: 0, y: 20 }];
const ANTENNA_PINS: PinDef[] = [{ id: "port", label: "ANT", role: "io", x: 0, y: SYMBOL_GRID_SIZE }];

const THREE_TERMINAL_AMP_PINS: PinDef[] = [
  { id: "inp", label: "+", role: "ctrlP", x: -60, y: -20 },
  { id: "inn", label: "-", role: "ctrlN", x: -60, y: 20 },
  { id: "out", label: "out", role: "out", x: 80, y: 0 }
];

const CLOCKED_THREE_TERMINAL_AMP_PINS: PinDef[] = [
  ...THREE_TERMINAL_AMP_PINS,
  { id: "clk", label: "clk", role: "clk", x: 0, y: 60 }
];

const VOLTAGE_CONTROLLED_PINS: PinDef[] = [
  { id: "p", label: "+", role: "p", x: -40, y: -20 },
  { id: "n", label: "-", role: "n", x: -40, y: 20 },
  { id: "cp", label: "cp", role: "ctrlP", x: 40, y: -20 },
  { id: "cn", label: "cn", role: "ctrlN", x: 40, y: 20 }
];

const CURRENT_CONTROLLED_PINS: PinDef[] = [
  { id: "p", label: "+", role: "p", x: -40, y: -20 },
  { id: "n", label: "-", role: "n", x: -40, y: 20 },
  { id: "sp", label: "sp", role: "senseP", x: 40, y: -20 },
  { id: "sn", label: "sn", role: "senseN", x: 40, y: 20 }
];

const DIFFERENTIAL_FOUR_PORT_PINS: PinDef[] = [
  { id: "inp", label: "in+", role: "ctrlP", x: -80, y: -40 },
  { id: "inn", label: "in-", role: "ctrlN", x: -80, y: 40 },
  { id: "outp", label: "out+", role: "outP", x: 60, y: -40 },
  { id: "outn", label: "out-", role: "outN", x: 60, y: 40 }
];

const CLOCKED_DIFFERENTIAL_FIVE_PORT_PINS: PinDef[] = [
  ...DIFFERENTIAL_FOUR_PORT_PINS,
  { id: "clk", label: "clk", role: "clk", x: 0, y: 80 }
];

const IDEAL_GM_PINS: PinDef[] = [
  { id: "inp", label: "in+", role: "ctrlP", x: -40, y: -20 },
  { id: "inn", label: "in-", role: "ctrlN", x: -40, y: 20 },
  { id: "out", label: "out", role: "out", x: 40, y: -20 },
  { id: "ref", label: "ref", role: "n", x: 40, y: 20 }
];

const INVERTER_PINS: PinDef[] = [
  { id: "in", label: "in", role: "in", x: -40, y: 0 },
  { id: "out", label: "out", role: "out", x: 40, y: 0 }
];
const INVERTER_SUPPLY_PINS: PinDef[] = [
  ...INVERTER_PINS,
  { id: "vdd", label: "VDD", role: "p", x: 0, y: -SYMBOL_GRID_SIZE },
  // A supply return is an explicit terminal; only a wired GND symbol grounds its net.
  { id: "gnd", label: "GND", role: "n", x: 0, y: SYMBOL_GRID_SIZE }
];
const CONVERTER_CLOCKED_PINS: PinDef[] = [
  ...INVERTER_PINS,
  { id: "clk", label: "clk", role: "clk", x: 0, y: 2 * SYMBOL_GRID_SIZE }
];
const SLICER_PINS = boxedHorizontalPins(SLICER_SIZE);
const SLICER_CLOCKED_PINS: PinDef[] = [
  ...SLICER_PINS,
  {
    id: "clk",
    label: "clk",
    role: "clk",
    ...boxedComponentPinPoint(SLICER_SIZE, "bottom")
  }
];
const SWITCH_PINS: PinDef[] = [
  ...TWO_TERMINAL_PINS,
  { id: "ctrl", label: "Ctrl", role: "ctrlP", x: 0, y: -20 }
];

const OPERATOR_PINS: PinDef[] = [
  { id: "left", label: "Left", role: "in", x: -2 * SYMBOL_GRID_SIZE, y: 0 },
  { id: "top", label: "Top", role: "in", x: 0, y: -2 * SYMBOL_GRID_SIZE },
  { id: "right", label: "Right", role: "out", x: 2 * SYMBOL_GRID_SIZE, y: 0 },
  { id: "bottom", label: "Bottom", role: "in", x: 0, y: 2 * SYMBOL_GRID_SIZE }
];

const MOS_PINS: PinDef[] = [
  { id: "d", label: "D", role: "drain", x: 0, y: -40 },
  { id: "g", label: "G", role: "gate", x: -40, y: 0 },
  { id: "s", label: "S", role: "source", x: 0, y: 40 },
  { id: "b", label: "B", role: "bulk", x: 0, y: 0 }
];

const PMOS_PINS: PinDef[] = [
  { id: "s", label: "S", role: "source", x: 0, y: -40 },
  { id: "g", label: "G", role: "gate", x: -40, y: 0 },
  { id: "d", label: "D", role: "drain", x: 0, y: 40 },
  { id: "b", label: "B", role: "bulk", x: 0, y: 0 }
];

const MOS_THREE_PIN_PINS: PinDef[] = MOS_PINS.filter((pin) => pin.id !== "b");
const PMOS_THREE_PIN_PINS: PinDef[] = PMOS_PINS.filter((pin) => pin.id !== "b");
const NPN_PINS: PinDef[] = [
  { id: "c", label: "C", role: "collector", x: 0, y: -40 },
  { id: "b", label: "B", role: "base", x: -40, y: 0 },
  { id: "e", label: "E", role: "emitter", x: 0, y: 40 }
];
const PNP_PINS: PinDef[] = [
  { id: "e", label: "E", role: "emitter", x: 0, y: -40 },
  { id: "b", label: "B", role: "base", x: -40, y: 0 },
  { id: "c", label: "C", role: "collector", x: 0, y: 40 }
];
type ThreeTerminalAmplifierType = Extract<ComponentType, "opAmp" | "ota">;
type DifferentialAmplifierType = Extract<ComponentType, "diffAmp" | "diffOta">;
type SingleInputAmplifierType = Extract<ComponentType, "amp" | "gm">;

type ValueFieldDef = Pick<ComponentDef, "valueKey" | "valueLabel" | "valuePlaceholder" | "valueUnit">;

function mainValue(valueLabel: string, valuePlaceholder: string, valueUnit?: string): ValueFieldDef {
  return {
    valueKey: "main",
    valueLabel,
    valuePlaceholder,
    ...(valueUnit ? { valueUnit } : {})
  };
}

const RESISTANCE_VALUE = mainValue("Resistance", "1k", "Ω");
const CAPACITANCE_VALUE = mainValue("Capacitance", "1p", "F");
const INDUCTANCE_VALUE = mainValue("Inductance", "1n", "H");
const IMPEDANCE_VALUE = mainValue("Impedance", "50", "Ω");
const VOLTAGE_VALUE = mainValue("Voltage", "1", "V");
const CURRENT_VALUE = mainValue("Current", "1m", "A");
const GAIN_VALUE = mainValue("Gain", "1");
const TRANSCONDUCTANCE_VALUE = mainValue("Transconductance", "1m", "S");
const TRANSRESISTANCE_VALUE = mainValue("Transresistance", "1k", "Ω");
const CONVERTER_BITS_VALUE: ValueFieldDef = {
  valueKey: CONVERTER_BITS_VALUE_KEY,
  valueLabel: "Bits",
  valuePlaceholder: DEFAULT_CONVERTER_BITS,
  valueUnit: "b"
};

function clonePins(pins: PinDef[]) {
  return pins.map((pin) => ({ ...pin }));
}

function mosVariants(baseSymbol: "nmos" | "pmos"): ComponentVariantDef[] {
  const pins = baseSymbol === "pmos" ? PMOS_PINS : MOS_PINS;
  const threePinPins = baseSymbol === "pmos" ? PMOS_THREE_PIN_PINS : MOS_THREE_PIN_PINS;
  return MOS_PIN_VIEWS.flatMap((pinView) =>
    MOS_VIEW_STYLES.map((style) => {
      const settings = { pins: pinView, ...style };
      const id = mosViewVariantId(settings);
      return {
        id,
        label: mosViewLabel(settings),
        terminalClass: pinView === "3pin" ? "threeTerminal" : "fourTerminal",
        size: MOS_SIZE,
        pins: pinView === "3pin" ? threePinPins : pins,
        symbol: `${baseSymbol}-${id}`
      };
    })
  );
}

function component(options: {
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
  nameFormat?: ComponentDef["nameFormat"];
  centeredRefLabel?: boolean;
  bodyPolygon?: ComponentDef["bodyPolygon"];
  editableGainPolarity?: boolean;
  editablePinVisibility?: boolean;
  editablePinVisibilityIds?: string[];
  editablePinMode?: boolean;
  size: { width: number; height: number };
  pins: PinDef[];
  symbol: string;
  defaultVariantId?: ComponentVariantId;
  variants?: ComponentVariantDef[];
}): ComponentDef {
  return {
    ...options,
    nameFormat: options.nameFormat ?? "schematic",
    defaultValues: options.defaultValues ? { ...options.defaultValues } : undefined,
    pins: clonePins(options.pins),
    variants: options.variants?.map((variant) => ({ ...variant, size: { ...variant.size }, pins: clonePins(variant.pins) }))
  };
}

function circularOperator(
  type: Extract<ComponentType, "plus" | "multiply">,
  label: string,
  valuePrefix: string,
  editablePinMode = false
) {
  return component({
    type,
    label,
    hotLabel: type,
    terminalClass: "fourTerminal",
    valuePrefix,
    defaultLabelVisible: false,
    editablePinVisibility: true,
    ...(editablePinMode ? { editablePinMode: true } : {}),
    defaultValues: {
      "pinVisible:top": "false",
      ...(editablePinMode
        ? {
            "pinMode:left": "positive",
            "pinMode:top": "positive",
            "pinMode:right": "output",
            "pinMode:bottom": "negative"
          }
        : {})
    },
    size: OPERATOR_SIZE,
    pins: OPERATOR_PINS,
    symbol: type
  });
}

function logicGate(type: LogicGateType, label: string) {
  return component({
    type,
    label,
    hotLabel: type,
    terminalClass: "threeTerminal",
    valuePrefix: label,
    nameFormat: "indexed",
    size: logicGateSize(DEFAULT_LOGIC_GATE_INPUT_COUNT),
    pins: logicGatePins(DEFAULT_LOGIC_GATE_INPUT_COUNT),
    symbol: logicGateSymbolId(type, DEFAULT_LOGIC_GATE_INPUT_COUNT),
    defaultVariantId: logicGateVariantId(DEFAULT_LOGIC_GATE_INPUT_COUNT),
    variants: logicGateVariants(type)
  });
}

function oneTerminal(type: ComponentType, label: string, hotLabel: string, symbol: string, pins = GROUND_PINS) {
  return component({ type, label, hotLabel, terminalClass: "oneTerminal", size: ONE_TERMINAL_SIZE, pins, symbol });
}

function twoTerminal(
  type: ComponentType,
  label: string,
  hotLabel: string,
  valuePrefix: string,
  symbol: string,
  valueField?: ValueFieldDef,
  pins = TWO_TERMINAL_PINS
) {
  return component({
    type,
    label,
    hotLabel,
    terminalClass: "twoTerminal",
    valuePrefix,
    ...valueField,
    size: TWO_TERMINAL_SIZE,
    pins,
    symbol
  });
}

function fourTerminal(
  type: ComponentType,
  label: string,
  hotLabel: string,
  valuePrefix: string,
  pins: PinDef[],
  valueField?: ValueFieldDef,
  symbol = "diamond"
) {
  return component({
    type,
    label,
    hotLabel,
    terminalClass: "fourTerminal",
    valuePrefix,
    ...valueField,
    size: FOUR_TERMINAL_SIZE,
    pins,
    symbol
  });
}

function threeTerminalAmplifier(
  type: ThreeTerminalAmplifierType,
  label: string,
  hotLabel: string,
  valuePrefix: string,
  symbol: string,
  valueField: ValueFieldDef
) {
  return component({
    type,
    label,
    hotLabel,
    terminalClass: "threeTerminal",
    valuePrefix,
    ...valueField,
    centeredRefLabel: true,
    size: THREE_TERMINAL_SIZE,
    pins: THREE_TERMINAL_AMP_PINS,
    symbol
  });
}

function differentialAmplifier(
  type: DifferentialAmplifierType,
  label: string,
  hotLabel: string,
  valuePrefix: string,
  valueField: ValueFieldDef,
  symbol = "differentialAmp"
) {
  return component({
    type,
    label,
    hotLabel,
    terminalClass: "fourTerminal",
    valuePrefix,
    ...valueField,
    centeredRefLabel: true,
    size: DIFFERENTIAL_FOUR_PORT_SIZE,
    pins: DIFFERENTIAL_FOUR_PORT_PINS,
    symbol
  });
}

function variableTwoTerminal(
  type: "resistor" | "capacitor",
  label: string,
  hotLabel: string,
  valuePrefix: string,
  symbol: string,
  valueField: ValueFieldDef
) {
  return component({
    type,
    label,
    hotLabel,
    terminalClass: "twoTerminal",
    valuePrefix,
    ...valueField,
    size: TWO_TERMINAL_SIZE,
    pins: TWO_TERMINAL_PINS,
    symbol,
    defaultVariantId: "fixed",
    variants: fixedVariableVariants("twoTerminal", TWO_TERMINAL_SIZE, TWO_TERMINAL_PINS, symbol)
  });
}

function fixedVariableVariants(
  terminalClass: TerminalClass,
  size: { width: number; height: number },
  pins: PinDef[],
  symbol: string
): ComponentVariantDef[] {
  return [
    { id: "fixed", label: "Fixed", terminalClass, size, pins, symbol },
    { id: "variable", label: "Variable", terminalClass, size, pins, symbol: `${symbol}-variable` }
  ];
}

function voltageSourceVariants(): ComponentVariantDef[] {
  return [
    { id: "dc", label: "dc", symbol: "voltageSource", valueLabel: "Voltage" },
    { id: "sine", label: "sine", symbol: "voltageSource-sine", valueLabel: "Amplitude 1 (Vpk)" },
    { id: "pulse", label: "pulse", symbol: "voltageSource-square", valueLabel: "One value" },
    { id: "exp", label: "exp", symbol: "voltageSource-exp", valueLabel: "One value" },
    { id: "bit", label: "bit", symbol: "voltageSource-bit", valueLabel: "One value" },
    { id: "pwl", label: "pwl", symbol: "voltageSource-pwl", valueLabel: "DC offset" },
    { id: "ramp", label: "ramp", symbol: "voltageSource-ramp-up", valueLabel: "End voltage" },
    { id: "noise", label: "noise", symbol: "voltageSource-noise", valueLabel: "Amplitude" }
  ].map((variant) => ({
    ...variant,
    terminalClass: "twoTerminal" as const,
    size: TWO_TERMINAL_SIZE,
    pins: TWO_TERMINAL_PINS,
    valuePlaceholder: "1"
  }));
}

function functionBlockVariants(type: FunctionBlockType): ComponentVariantDef[] {
  return functionBlockViewOptions(type).map(({ id, label }) => {
    const model = resolveFunctionBlockModel({ type, variantId: id, values: {} });
    if (!model) throw new Error(`Missing ${type} function-block geometry.`);
    return {
      id,
      label,
      terminalClass: "twoTerminal",
      size: { ...model.size },
      pins: model.pins.map((pin) => ({ ...pin })),
      symbol: "function-block"
    };
  });
}

function functionBlock(
  type: Extract<ComponentType, "integrator" | "differentiator" | "delay" | "filter">,
  label: string,
  hotLabel: string,
  valuePrefix: string,
  variants: ComponentVariantDef[]
) {
  const defaultVariantId = DEFAULT_FUNCTION_BLOCK_VIEW[type];
  const model = resolveFunctionBlockModel({ type, variantId: defaultVariantId, values: {} });
  if (!model) throw new Error(`Missing default ${type} function-block geometry.`);
  return component({
    type,
    label,
    hotLabel,
    terminalClass: "twoTerminal",
    valuePrefix,
    defaultLabelVisible: false,
    size: { ...model.size },
    ...(supportsFunctionBlockGain(type) ? {
      ...GAIN_VALUE,
      valueKey: FUNCTION_BLOCK_GAIN_VALUE_KEY,
      defaultValues: { [FUNCTION_BLOCK_GAIN_VALUE_KEY]: DEFAULT_FUNCTION_BLOCK_GAIN }
    } : {}),
    ...(type === "delay" ? { valueKey: DELAY_VALUE_KEY, valueLabel: "Value", valuePlaceholder: defaultDelayValue() } : {}),
    pins: model.pins.map((pin) => ({ ...pin })),
    symbol: "function-block",
    defaultVariantId,
    variants
  });
}

function analogBufferVariants(): ComponentVariantDef[] {
  return [
    {
      id: "linear",
      label: "Linear",
      terminalClass: "twoTerminal",
      size: INVERTER_SIZE,
      pins: clonePins(INVERTER_PINS),
      symbol: "analogBuffer"
    },
    {
      id: "nonlinear",
      label: "Nonlinear",
      terminalClass: "twoTerminal",
      size: INVERTER_SIZE,
      pins: clonePins(INVERTER_PINS),
      symbol: "analogBuffer-nonlinear"
    }
  ];
}

function analogBufferFamily() {
  return component({
    type: "analogBuffer",
    label: "BUF",
    hotLabel: "abuffer",
    terminalClass: "twoTerminal",
    valuePrefix: "X",
    editableGainPolarity: true,
    size: INVERTER_SIZE,
    pins: INVERTER_PINS,
    symbol: "analogBuffer",
    defaultVariantId: "linear",
    variants: analogBufferVariants()
  });
}

function singleInputAmplifier(type: SingleInputAmplifierType, label: string, hotLabel: string, valuePrefix: string) {
  return component({
    type,
    label,
    hotLabel,
    terminalClass: "twoTerminal",
    valuePrefix,
    ...(type === "gm" ? TRANSCONDUCTANCE_VALUE : GAIN_VALUE),
    centeredRefLabel: true,
    editableGainPolarity: true,
    size: INVERTER_SIZE,
    pins: INVERTER_PINS,
    symbol: type === "gm" ? "singleInputGm" : type
  });
}

export const COMPONENT_CATALOG: Record<ComponentType, ComponentDef> = {
  gnd: { ...oneTerminal("gnd", "GND", "gnd", "gnd"), defaultLabelVisible: false },
  vdd: {
    ...oneTerminal("vdd", "VDD", "vdd", "vdd", VDD_PINS),
    ...VOLTAGE_VALUE,
    defaultLabelVisible: false
  },
  antenna: {
    ...oneTerminal("antenna", "ANT", "antenna", "antenna", ANTENNA_PINS),
    size: { width: 2 * SYMBOL_GRID_SIZE, height: 2 * SYMBOL_GRID_SIZE },
    defaultLabelVisible: false
  },
  resistor: variableTwoTerminal("resistor", "R", "resistor", "R", "resistor", RESISTANCE_VALUE),
  capacitor: variableTwoTerminal("capacitor", "C", "capacitor", "C", "capacitor", CAPACITANCE_VALUE),
  inductor: {
    ...twoTerminal("inductor", "L", "inductor", "L", "inductor", INDUCTANCE_VALUE),
    defaultVariantId: "coil",
    variants: [
      { id: "coil", label: "schematic", terminalClass: "twoTerminal", size: TWO_TERMINAL_SIZE, pins: TWO_TERMINAL_PINS, symbol: "inductor" },
      { id: "planar", label: "layout", terminalClass: "twoTerminal", size: PLANAR_INDUCTOR_SIZE, pins: planarInductorPins(), symbol: "inductor-planar" }
    ]
  },
  diode: twoTerminal("diode", "D", "diode", "D", "diode", undefined, DIODE_PINS),
  impedance: twoTerminal("impedance", "Z", "impedance", "Z", "impedance", IMPEDANCE_VALUE),
  voltageSource: component({
    type: "voltageSource",
    label: "V",
    hotLabel: "vsource",
    terminalClass: "twoTerminal",
    valuePrefix: "V",
    ...VOLTAGE_VALUE,
    size: TWO_TERMINAL_SIZE,
    pins: TWO_TERMINAL_PINS,
    symbol: "voltageSource",
    defaultVariantId: "dc",
    variants: voltageSourceVariants()
  }),
  currentSource: twoTerminal("currentSource", "I", "isource", "I", "currentSource", CURRENT_VALUE),
  battery: twoTerminal("battery", "BAT", "battery", "V", "battery", VOLTAGE_VALUE),
  iprobe: twoTerminal("iprobe", "IP", "iprobe", "IP", "iprobe"),
  diffProbe: twoTerminal("diffProbe", "VP", "diffprobe", "VP", "diffProbe"),
  plus: circularOperator("plus", "+", "SUM", true),
  multiply: circularOperator("multiply", "×", "MUL"),
  adc: component({
    type: "adc",
    label: "ADC",
    hotLabel: "adc",
    terminalClass: "twoTerminal",
    valuePrefix: "ADC",
    ...CONVERTER_BITS_VALUE,
    defaultValues: { [CONVERTER_BITS_VALUE_KEY]: DEFAULT_CONVERTER_BITS },
    defaultLabelVisible: false,
    editablePinVisibility: true,
    editablePinVisibilityIds: ["out"],
    size: CONVERTER_SIZE,
    pins: INVERTER_PINS,
    symbol: "adc",
    defaultVariantId: "plain",
    variants: [
      {
        id: "plain",
        label: "Plain",
        terminalClass: "twoTerminal",
        size: CONVERTER_SIZE,
        pins: INVERTER_PINS,
        symbol: "adc"
      },
      {
        id: "quantizer",
        label: "Quantizer",
        terminalClass: "twoTerminal",
        size: CONVERTER_SIZE,
        pins: INVERTER_PINS,
        symbol: "adc-quantizer"
      }
    ]
  }),
  dac: component({
    type: "dac",
    label: "DAC",
    hotLabel: "dac",
    terminalClass: "twoTerminal",
    valuePrefix: "DAC",
    ...CONVERTER_BITS_VALUE,
    defaultValues: { [CONVERTER_BITS_VALUE_KEY]: DEFAULT_CONVERTER_BITS },
    defaultLabelVisible: false,
    editablePinVisibility: true,
    editablePinVisibilityIds: ["in"],
    size: CONVERTER_SIZE,
    pins: INVERTER_PINS,
    symbol: "dac"
  }),
  integrator: functionBlock(
    "integrator",
    "INT",
    "integrator",
    "INT",
    functionBlockVariants("integrator")
  ),
  differentiator: functionBlock(
    "differentiator",
    "DIF",
    "differentiator",
    "DIF",
    functionBlockVariants("differentiator")
  ),
  delay: functionBlock(
    "delay",
    "DLY",
    "delay",
    "DLY",
    functionBlockVariants("delay")
  ),
  filter: functionBlock(
    "filter",
    "FLT",
    "filter",
    "FLT",
    functionBlockVariants("filter")
  ),
  vcvs: fourTerminal("vcvs", "E", "vcvs", "A", VOLTAGE_CONTROLLED_PINS, GAIN_VALUE),
  vccs: fourTerminal("vccs", "G", "vccs", "gm", VOLTAGE_CONTROLLED_PINS, TRANSCONDUCTANCE_VALUE),
  cccs: fourTerminal("cccs", "F", "cccs", "beta", CURRENT_CONTROLLED_PINS, GAIN_VALUE),
  ccvs: fourTerminal("ccvs", "H", "ccvs", "Rm", CURRENT_CONTROLLED_PINS, TRANSRESISTANCE_VALUE),
  opAmp: threeTerminalAmplifier("opAmp", "OA", "opamp", "Aop", "opAmp", GAIN_VALUE),
  ota: threeTerminalAmplifier("ota", "OTA", "ota", "Gm", "ota", TRANSCONDUCTANCE_VALUE),
  comparator: component({
    type: "comparator",
    label: "CMP",
    hotLabel: "comparator",
    terminalClass: "threeTerminal",
    valueKey: "levels",
    valueLabel: "Levels",
    valuePlaceholder: "1",
    defaultValues: { levels: "1" },
    size: THREE_TERMINAL_SIZE,
    pins: THREE_TERMINAL_AMP_PINS,
    symbol: "comparator"
  }),
  slicer: component({
    type: "slicer",
    label: "SLC",
    hotLabel: "slicer",
    terminalClass: "twoTerminal",
    valuePrefix: "SLC",
    valueKey: "levels",
    valueLabel: "Levels",
    valuePlaceholder: "1",
    defaultValues: { levels: "1" },
    size: SLICER_SIZE,
    pins: SLICER_PINS,
    symbol: "slicer"
  }),
  diffAmp: differentialAmplifier("diffAmp", "DA", "diffamp", "Ad", GAIN_VALUE),
  diffOta: differentialAmplifier("diffOta", "DOTA", "diffota", "Gm", TRANSCONDUCTANCE_VALUE, "differentialOta"),
  diffComparator: component({
    type: "diffComparator",
    label: "DCMP",
    hotLabel: "diffcomparator",
    terminalClass: "fourTerminal",
    valueKey: "levels",
    valueLabel: "Levels",
    valuePlaceholder: "1",
    defaultValues: { levels: "1", differentialOutputsSame: "true" },
    size: DIFFERENTIAL_FOUR_PORT_SIZE,
    pins: DIFFERENTIAL_FOUR_PORT_PINS,
    symbol: "differentialComparator"
  }),
  idealGm: {
    ...fourTerminal("idealGm", "gm", "idealgm", "gm", IDEAL_GM_PINS, TRANSCONDUCTANCE_VALUE),
    centeredRefLabel: true
  },
  inverter: component({
    type: "inverter",
    label: "INV",
    hotLabel: "inverter",
    terminalClass: "fourTerminal",
    valuePrefix: "X",
    editablePinVisibility: true,
    editablePinVisibilityIds: ["vdd", "gnd"],
    defaultValues: { "pinVisible:vdd": "false", "pinVisible:gnd": "false" },
    size: INVERTER_SIZE,
    pins: INVERTER_SUPPLY_PINS,
    symbol: "inverter",
    defaultVariantId: "fixed",
    variants: fixedVariableVariants("fourTerminal", INVERTER_SIZE, INVERTER_SUPPLY_PINS, "inverter")
  }),
  digitalBuffer: component({
    type: "digitalBuffer",
    label: "BUF",
    hotLabel: "dbuffer",
    terminalClass: "twoTerminal",
    valuePrefix: "X",
    size: INVERTER_SIZE,
    pins: INVERTER_PINS,
    symbol: "digitalBuffer"
  }),
  and: logicGate("and", "AND"),
  nand: logicGate("nand", "NAND"),
  or: logicGate("or", "OR"),
  nor: logicGate("nor", "NOR"),
  xor: logicGate("xor", "XOR"),
  xnor: logicGate("xnor", "XNOR"),
  dff: component({
    type: "dff",
    label: "DFF",
    hotLabel: "dff",
    terminalClass: "dynamic",
    valuePrefix: "DFF",
    nameFormat: "indexed",
    editablePinVisibility: true,
    editablePinVisibilityIds: ["q", "qbar"],
    size: DFF_SIZE,
    pins: dffPins(DEFAULT_DFF_SETTINGS),
    symbol: "dff"
  }),
  analogBuffer: analogBufferFamily(),
  amp: singleInputAmplifier("amp", "AMP", "amp", "A"),
  gm: singleInputAmplifier("gm", "GM", "gm", "Gm"),
  nmos: component({
    type: "nmos",
    label: "NMOS",
    hotLabel: "nmos",
    aliases: ["nch"],
    terminalClass: "threeTerminal",
    valuePrefix: "M",
    size: MOS_SIZE,
    pins: MOS_THREE_PIN_PINS,
    symbol: `nmos-${DEFAULT_MOS_VIEW_VARIANT_ID}`,
    defaultVariantId: DEFAULT_MOS_VIEW_VARIANT_ID,
    variants: mosVariants("nmos")
  }),
  pmos: component({
    type: "pmos",
    label: "PMOS",
    hotLabel: "pmos",
    aliases: ["pch"],
    terminalClass: "threeTerminal",
    valuePrefix: "M",
    size: MOS_SIZE,
    pins: PMOS_THREE_PIN_PINS,
    symbol: `pmos-${DEFAULT_MOS_VIEW_VARIANT_ID}`,
    defaultVariantId: DEFAULT_MOS_VIEW_VARIANT_ID,
    variants: mosVariants("pmos")
  }),
  npn: component({
    type: "npn",
    label: "NPN",
    hotLabel: "npn",
    terminalClass: "threeTerminal",
    valuePrefix: "Q",
    size: MOS_SIZE,
    pins: NPN_PINS,
    symbol: "npn"
  }),
  pnp: component({
    type: "pnp",
    label: "PNP",
    hotLabel: "pnp",
    terminalClass: "threeTerminal",
    valuePrefix: "Q",
    size: MOS_SIZE,
    pins: PNP_PINS,
    symbol: "pnp"
  }),
  switch: component({
    type: "switch",
    label: "SW",
    hotLabel: "switch",
    terminalClass: "threeTerminal",
    valuePrefix: "S",
    editablePinVisibility: true,
    editablePinVisibilityIds: ["ctrl"],
    defaultValues: { "pinVisible:ctrl": "false" },
    size: TWO_TERMINAL_SIZE,
    pins: SWITCH_PINS,
    symbol: "switch-open",
    defaultVariantId: "open",
    variants: [
      { id: "open", label: "Open", terminalClass: "threeTerminal", size: TWO_TERMINAL_SIZE, pins: SWITCH_PINS, symbol: "switch-open" },
      { id: "closed", label: "Closed", terminalClass: "threeTerminal", size: TWO_TERMINAL_SIZE, pins: SWITCH_PINS, symbol: "switch-closed" }
    ]
  }),
  spntSwitch: component({
    type: "spntSwitch",
    label: "SPNT",
    hotLabel: "spnt",
    terminalClass: "dynamic",
    valuePrefix: "S",
    valueKey: SPNT_POSITION_VALUE_KEY,
    valueLabel: "Position (0 = open)",
    valuePlaceholder: "1",
    defaultValues: { [SPNT_POSITION_VALUE_KEY]: "1" },
    size: spntSize(DEFAULT_SPNT_THROW_COUNT),
    pins: spntPins(DEFAULT_SPNT_THROW_COUNT),
    symbol: spntSymbolId(DEFAULT_SPNT_THROW_COUNT),
    defaultVariantId: `${DEFAULT_SPNT_THROW_COUNT}-throw`,
    variants: spntVariants()
  }),
  transmissionGate: component({
    type: "transmissionGate",
    label: "TG",
    hotLabel: "transmission_gate",
    aliases: ["pass_gate"],
    terminalClass: "fourTerminal",
    valuePrefix: "TG",
    nameFormat: "indexed",
    size: TRANSMISSION_GATE_SIZE,
    pins: [
      ...boxedHorizontalPins(TRANSMISSION_GATE_SIZE, {
        inputId: "a", inputLabel: "A", inputRole: "io",
        outputId: "b", outputLabel: "B", outputRole: "io"
      }),
      { id: "enbar", label: "EN̅", role: "ctrlN", ...boxedComponentPinPoint(TRANSMISSION_GATE_SIZE, "top") },
      { id: "en", label: "EN", role: "ctrlP", ...boxedComponentPinPoint(TRANSMISSION_GATE_SIZE, "bottom") }
    ],
    symbol: "transmission-gate"
  }),
  rectangle: component({
    type: "rectangle",
    label: "RECT",
    hotLabel: "rectangle",
    terminalClass: "dynamic",
    valuePrefix: "X",
    defaultValues: rectangleDefaultValues(),
    nameFormat: "literal",
    centeredRefLabel: true,
    size: DEFAULT_RECTANGLE_SIZE,
    pins: DEFAULT_RECTANGLE_PINS,
    symbol: "rectangle"
  }),
  triangle: component({
    type: "triangle",
    label: "TRI",
    hotLabel: "triangle",
    aliases: ["tri", "三角形"],
    terminalClass: "dynamic",
    valuePrefix: "X",
    defaultValues: {
      ...triangleSettingsValues(DEFAULT_TRIANGLE_SETTINGS),
      ...Object.fromEntries(TRIANGLE_VERTICES.map(vertex => [`pinVisible:${vertex}`, "false"]))
    },
    editablePinVisibility: true,
    editablePinVisibilityIds: [...TRIANGLE_VERTICES],
    nameFormat: "literal",
    centeredRefLabel: true,
    size: triangleSize(DEFAULT_TRIANGLE_SETTINGS),
    pins: [...trianglePinGeometry(DEFAULT_TRIANGLE_SETTINGS), ...triangleVertexPinGeometry(DEFAULT_TRIANGLE_SETTINGS)].map(lead => lead.pin),
    bodyPolygon: TRIANGLE_VERTICES.map(vertex => DEFAULT_TRIANGLE_SETTINGS.vertices[vertex]),
    symbol: "triangle"
  }),
  annotation: component({
    type: "annotation",
    label: "TXT",
    hotLabel: "annotation",
    terminalClass: "annotation",
    ...mainValue("Text", "Annotation text"),
    size: ANNOTATION_SIZE,
    pins: [],
    symbol: "annotation"
  })
};

export const PALETTE_ORDER: ComponentType[] = [
  "gnd",
  "vdd",
  "antenna",
  "resistor",
  "capacitor",
  "inductor",
  "diode",
  "impedance",
  "voltageSource",
  "currentSource",
  "battery",
  "iprobe",
  "diffProbe",
  "plus",
  "multiply",
  "adc",
  "dac",
  "integrator",
  "differentiator",
  "delay",
  "filter",
  "vcvs",
  "vccs",
  "cccs",
  "ccvs",
  "opAmp",
  "ota",
  "comparator",
  "slicer",
  "diffAmp",
  "diffOta",
  "diffComparator",
  "idealGm",
  "inverter",
  "digitalBuffer",
  "and",
  "nand",
  "or",
  "nor",
  "xor",
  "xnor",
  "dff",
  "analogBuffer",
  "amp",
  "gm",
  "switch",
  "spntSwitch",
  "transmissionGate",
  "rectangle",
  "triangle",
  "nmos",
  "pmos",
  "npn",
  "pnp"
];

export function getComponentDef(type: ComponentType) {
  return COMPONENT_CATALOG[type];
}

export function getComponentVariants(type: ComponentType) {
  return COMPONENT_CATALOG[type].variants ?? [];
}

/** Effective instance definition: disabled pins are absent from rendering and connectivity. */
export function resolveComponentDef(component: ComponentInstance | ComponentType): ComponentDef {
  const definition = scaleComponentDefinition(resolveComponentConfiguration(component), typeof component === "string" ? 1 : componentScale(component));
  if (!definition.editablePinVisibility) return definition;
  const values = typeof component === "string" ? definition.defaultValues : component.values;
  return {
    ...definition,
    pins: definition.pins.filter((pin) => {
      if (definition.editablePinVisibilityIds && !definition.editablePinVisibilityIds.includes(pin.id)) return true;
      const key = `pinVisible:${pin.id}`;
      return (values?.[key] ?? definition.defaultValues?.[key]) !== "false";
    })
  };
}

/** Full pin choices for configuration and validation, including pins currently disabled. */
export function resolveComponentPinOptions(component: ComponentInstance | ComponentType) {
  return scaleComponentDefinition(resolveComponentConfiguration(component), typeof component === "string" ? 1 : componentScale(component)).pins;
}

function resolveComponentConfiguration(component: ComponentInstance | ComponentType): ComponentDef {
  const base = typeof component === "string" ? COMPONENT_CATALOG[component] : COMPONENT_CATALOG[component.type];
  if (base.type === "triangle" && typeof component !== "string") {
    const settings = triangleSettings(component);
    return { ...base, size: triangleSize(settings), pins: [...trianglePinGeometry(settings), ...triangleVertexPinGeometry(settings)].map(lead => lead.pin), bodyPolygon: TRIANGLE_VERTICES.map(vertex => settings.vertices[vertex]) };
  }
  if (base.type === "inductor" && typeof component !== "string") {
    const tap = inductorTap(component);
    if (isPlanarInductor(component)) {
      return {
        ...base,
        terminalClass: tap === "none" ? "twoTerminal" : "threeTerminal",
        size: { ...PLANAR_INDUCTOR_SIZE },
        pins: planarInductorPins(tap),
        symbol: "inductor-planar",
        variantId: "planar",
        variantLabel: "layout"
      };
    }
    if (tap !== "none") {
      return {
        ...base,
        terminalClass: "threeTerminal",
        size: { ...TAPPED_INDUCTOR_SIZE },
        pins: tappedInductorPins(tap)
      };
    }
  }
  if (base.type === "dff") {
    const settings = typeof component === "string"
      ? DEFAULT_DFF_SETTINGS
      : dffSettings(component);
    return {
      ...base,
      size: { ...DFF_SIZE },
      pins: dffPins(settings),
      symbol: "dff"
    };
  }
  if (base.type === "rectangle") {
    const settings = typeof component === "string"
      ? DEFAULT_RECTANGLE_SETTINGS
      : rectangleSettings(component);
    return {
      ...base,
      size: rectangleSize(settings),
      pins: rectanglePins(settings)
    };
  }
  const requestedVariantId = typeof component === "string"
    ? base.defaultVariantId
    : component.variantId ?? base.defaultVariantId;
  const variantId = requestedVariantId;
  const variant = variantId ? base.variants?.find((candidate) => candidate.id === variantId) : undefined;
  const resolved = variant ? {
    ...base,
    terminalClass: variant.terminalClass,
    size: { ...variant.size },
    pins: clonePins(variant.pins),
    symbol: variant.symbol,
    valueLabel: variant.valueLabel ?? base.valueLabel,
    valuePlaceholder: variant.valuePlaceholder ?? base.valuePlaceholder,
    variantId: variant.id,
    variantLabel: variant.label
  } : base;
  const resolvedWithClock = typeof component !== "string"
    && componentClockForInstance(component) !== "none"
    ? resolveClockedDefinition(resolved)
    : resolved;
  const resolvedWithCircle = isTransistorComponentType(base.type) && typeof component !== "string"
    ? {
        ...resolvedWithClock,
        symbol: symbolWithTransistorCircle(
          resolvedWithClock.symbol + (mosThickGate(component) ? MOS_THICK_GATE_SYMBOL_SUFFIX : ""),
          transistorCircleVisible(component)
        )
      }
    : resolvedWithClock;
  const resolvedWithOutputOrder = supportsDifferentialOutputOrder(base.type) && typeof component !== "string"
    ? {
        ...resolvedWithCircle,
        pins: resolveDifferentialOutputPins(
          resolvedWithCircle.pins,
          differentialOutputsSame(component)
        )
      }
    : resolvedWithCircle;
  if (typeof component !== "string") {
    if (base.type === "spntSwitch") {
      return { ...resolvedWithOutputOrder, symbol: spntSymbolId(spntThrowCount(component), spntPosition(component)) };
    }
    if (base.type === "voltageSource" && variantId === "ramp") {
      return { ...resolvedWithOutputOrder, symbol: `voltageSource-ramp-${voltageSourceFieldValue(component, "vsource:ramp:direction")}` };
    }
  }
  if (!isFunctionBlockType(base.type)) return resolvedWithOutputOrder;
  const model = resolveFunctionBlockModel({
    type: base.type,
    variantId: variantId ?? base.defaultVariantId,
    values: typeof component === "string" ? { ...(base.defaultValues ?? {}) } : component.values
  });
  if (!model) return resolved;
  return {
    ...resolvedWithOutputOrder,
    ...(base.type === "delay" ? {
      defaultValues: { ...resolvedWithOutputOrder.defaultValues, [DELAY_VALUE_KEY]: defaultDelayValue(model.timeDomain) },
      valuePlaceholder: defaultDelayValue(model.timeDomain)
    } : {}),
    terminalClass: model.clock === "none" ? "twoTerminal" : "threeTerminal",
    size: { ...model.size },
    pins: model.pins.map((pin) => ({ ...pin })),
    symbol: "function-block",
    variantId: model.variantId,
    variantLabel: base.variants?.find((candidate) => candidate.id === model.variantId)?.label
  };
}

function resolveClockedDefinition(definition: ComponentDef): ComponentDef {
  if (definition.type === "adc" || definition.type === "dac") {
    return {
      ...definition,
      terminalClass: "threeTerminal",
      pins: clonePins(CONVERTER_CLOCKED_PINS)
    };
  }
  if (definition.type === "comparator") {
    return {
      ...definition,
      terminalClass: "fourTerminal",
      pins: clonePins(CLOCKED_THREE_TERMINAL_AMP_PINS)
    };
  }
  if (definition.type === "diffComparator") {
    return {
      ...definition,
      terminalClass: "fiveTerminal",
      pins: clonePins(CLOCKED_DIFFERENTIAL_FIVE_PORT_PINS)
    };
  }
  if (definition.type === "slicer") {
    return {
      ...definition,
      terminalClass: "threeTerminal",
      pins: clonePins(SLICER_CLOCKED_PINS)
    };
  }
  return definition;
}

export function isValidComponentVariant(type: ComponentType, variantId: ComponentVariantId | undefined) {
  if (!variantId) return true;
  return getComponentVariants(type).some((variant) => variant.id === variantId);
}
