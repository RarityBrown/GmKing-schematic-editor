import {
  mosfetBodySymbol,
  mosfetGateSymbol,
  mosfetMarkerSymbol,
  parseMosSymbol
} from "./mosSymbols";
import {
  bjtBaseSymbol,
  bjtBodySymbol,
  bjtMarkerSymbol,
  parseBjtSymbol
} from "./bjtSymbols";
import {
  batteryPlateStrokeWidth,
  batteryPlateSymbol,
  batterySymbol,
  diffProbeFrameSymbol,
  diffProbeStrokeWidth,
  diffProbeSymbol,
  controlledSourceSymbol,
  currentSourceArrowSymbol,
  currentSourceSymbol,
  impedanceBoxStrokeWidth,
  impedanceBoxSymbol,
  impedanceSymbol,
  iprobeFrameSymbol,
  iprobeStrokeWidth,
  iprobeSymbol,
  voltageSourceSymbol,
  voltageSourceWaveformSymbol
} from "./sourceSymbols";
import { switchSymbol, spntSwitchSymbol } from "./switchSymbols";
import { transmissionGateBody, transmissionGateLeads } from "./transmissionGateSymbols";
import { diodeBodySymbol, diodeLeadSymbol } from "./diodeSymbols";
import { planarInductorBody, planarInductorLeads } from "./planarInductorSymbols";
import { PLANAR_INDUCTOR_SCALE } from "../inductorModel";
import { parseSpntSymbol } from "../spntSwitchModel";
import {
  capacitorPlateStrokeWidth,
  capacitorPlateSymbol,
  capacitorSymbol,
  inductorSymbol,
  resistorSymbol,
  variableCapacitorSymbol,
  variablePassiveArrowMarkerSymbol,
  variableResistorSymbol
} from "./passiveSymbols";
import { groundHorizontalSymbol, groundSymbol, vddHorizontalSymbol, vddSymbol } from "./groundSymbols";
import { antennaBodySymbol, antennaLeadSymbol } from "./antennaSymbols";
import {
  analogBufferSymbol,
  analogBufferTriangleSymbol,
  analogBufferNonlinearAccentSymbol,
  bufferAccentStrokeWidth,
  digitalBufferSymbol,
  digitalBufferTriangleSymbol,
  inverterAccentSymbol,
  inverterSymbol,
  variableInverterSymbol
} from "./bufferSymbols";
import { variableSymbolArrowMarkerSymbol } from "./variableSymbolDecoration";
import {
  comparatorAccentSymbol,
  comparatorBodySymbol,
  differentialAmpBodySymbol,
  differentialAmpLeadSymbol,
  differentialComparatorAccentSymbol,
  differentialComparatorBodySymbol,
  differentialOtaBodySymbol,
  differentialOtaLeadSymbol,
  opAmpBodySymbol,
  otaBodySymbol,
  singleInputAmplifierBodySymbol,
  singleInputAmplifierLeadSymbol,
  singleEndedAmpLeadSymbol,
  slicerAccentSymbol,
  slicerBodySymbol
} from "./amplifierSymbols";
import { SYMBOL_STROKE_WIDTH } from "./symbolPrimitives";
import {
  multiplyAccentStrokeWidth,
  multiplyAccentSymbol,
  multiplySymbol,
  plusAccentStrokeWidth,
  plusAccentSymbol,
  plusSymbol
} from "./operatorSymbols";
import {
  adcPentagonSymbol,
  adcQuantizerSymbol,
  adcSymbol,
  converterPentagonStrokeWidth,
  dacPentagonSymbol,
  dacSymbol
} from "./converterSymbols";
import { rectangleFrameSymbol } from "./rectangleSymbols";
import { triangleFrameSymbol } from "./triangleSymbols";
import { parseLogicGateSymbol } from "../logicGateModel";
import {
  logicGateAccentStrokeWidth,
  logicGateSymbolAccentFromId,
  logicGateSymbolBodyFromId
} from "./logicGateSymbols";
import { DEFAULT_DFF_SETTINGS } from "../dffModel";
import {
  dffAccentStrokeWidth,
  dffAccentSymbol,
  dffBodySymbol
} from "./dffSymbols";

type SymbolPathBuilder = (width: number, height: number) => string;

interface SymbolDefinition {
  body: SymbolPathBuilder;
  accent?: SymbolPathBuilder;
  accentStrokeWidth?: (lineWidth: number) => number;
  marker?: SymbolPathBuilder;
  strokeWidth?: (lineWidth: number) => number;
}

const ANALOG_BUFFER_SYMBOL_DEFINITION: SymbolDefinition = {
  body: analogBufferSymbol,
  accent: analogBufferTriangleSymbol,
  accentStrokeWidth: bufferAccentStrokeWidth
};

const SINGLE_INPUT_AMPLIFIER_SYMBOL_DEFINITION: SymbolDefinition = {
  body: singleInputAmplifierLeadSymbol,
  accent: singleInputAmplifierBodySymbol,
  accentStrokeWidth: (lineWidth) => 2 * lineWidth
};

const DEFAULT_DFF_PIN_IDS = new Set(["d", "clk", "q", "qbar"]);

const SYMBOL_DEFINITIONS: Record<string, SymbolDefinition> = {
  "transmission-gate": {
    body: transmissionGateLeads,
    accent: transmissionGateBody,
    accentStrokeWidth: (lineWidth) => 2 * lineWidth
  },
  resistor: { body: resistorSymbol },
  "resistor-variable": {
    body: variableResistorSymbol,
    marker: variablePassiveArrowMarkerSymbol
  },
  capacitor: {
    body: capacitorSymbol,
    accent: capacitorPlateSymbol,
    accentStrokeWidth: capacitorPlateStrokeWidth
  },
  "capacitor-variable": {
    body: variableCapacitorSymbol,
    accent: capacitorPlateSymbol,
    accentStrokeWidth: capacitorPlateStrokeWidth,
    marker: variablePassiveArrowMarkerSymbol
  },
  inductor: { body: inductorSymbol },
  "inductor-planar": {
    body: planarInductorLeads,
    accent: (width, height) => planarInductorBody(width, height),
    accentStrokeWidth: lineWidth => 3 * PLANAR_INDUCTOR_SCALE * lineWidth
  },
  diode: {
    body: diodeLeadSymbol,
    accent: diodeBodySymbol,
    accentStrokeWidth: (lineWidth) => 2 * lineWidth
  },
  impedance: {
    body: impedanceSymbol,
    accent: impedanceBoxSymbol,
    accentStrokeWidth: impedanceBoxStrokeWidth
  },
  gnd: {
    body: groundSymbol,
    accent: groundHorizontalSymbol,
    accentStrokeWidth: (lineWidth) => 2 * lineWidth
  },
  vdd: {
    body: vddSymbol,
    accent: vddHorizontalSymbol,
    accentStrokeWidth: (lineWidth) => 2 * lineWidth
  },
  antenna: {
    body: antennaLeadSymbol,
    accent: antennaBodySymbol,
    accentStrokeWidth: (lineWidth) => 2 * lineWidth
  },
  voltageSource: { body: voltageSourceSymbol },
  "voltageSource-sine": { body: (width, height) => voltageSourceWaveformSymbol(width, height, "sine") },
  "voltageSource-noise": { body: (width, height) => voltageSourceWaveformSymbol(width, height, "noise") },
  "voltageSource-square": { body: (width, height) => voltageSourceWaveformSymbol(width, height, "square") },
  "voltageSource-exp": { body: (width, height) => voltageSourceWaveformSymbol(width, height, "exp") },
  "voltageSource-bit": { body: (width, height) => voltageSourceWaveformSymbol(width, height, "bit") },
  "voltageSource-pwl": { body: (width, height) => voltageSourceWaveformSymbol(width, height, "pwl") },
  "voltageSource-ramp-up": { body: (width, height) => voltageSourceWaveformSymbol(width, height, "ramp-up") },
  "voltageSource-ramp-down": { body: (width, height) => voltageSourceWaveformSymbol(width, height, "ramp-down") },
  currentSource: {
    body: currentSourceSymbol,
    marker: currentSourceArrowSymbol
  },
  battery: {
    body: batterySymbol,
    accent: batteryPlateSymbol,
    accentStrokeWidth: batteryPlateStrokeWidth
  },
  iprobe: {
    body: iprobeSymbol,
    accent: iprobeFrameSymbol,
    accentStrokeWidth: iprobeStrokeWidth
  },
  diffProbe: {
    body: diffProbeSymbol,
    accent: diffProbeFrameSymbol,
    accentStrokeWidth: diffProbeStrokeWidth
  },
  plus: {
    body: plusSymbol,
    accent: plusAccentSymbol,
    accentStrokeWidth: plusAccentStrokeWidth
  },
  multiply: {
    body: multiplySymbol,
    accent: multiplyAccentSymbol,
    accentStrokeWidth: multiplyAccentStrokeWidth
  },
  adc: {
    body: adcSymbol,
    accent: adcPentagonSymbol,
    accentStrokeWidth: converterPentagonStrokeWidth
  },
  "adc-quantizer": {
    body: adcQuantizerSymbol,
    accent: adcPentagonSymbol,
    accentStrokeWidth: converterPentagonStrokeWidth
  },
  dac: {
    body: dacSymbol,
    accent: dacPentagonSymbol,
    accentStrokeWidth: converterPentagonStrokeWidth
  },
  switch: { body: switchSymbol },
  "switch-open": { body: switchSymbol },
  "switch-closed": { body: (width, height) => switchSymbol(width, height, SYMBOL_STROKE_WIDTH, true) },
  opAmp: {
    body: opAmpBodySymbol,
    accent: singleEndedAmpLeadSymbol,
    strokeWidth: (lineWidth) => 2 * lineWidth
  },
  ota: {
    body: otaBodySymbol,
    accent: singleEndedAmpLeadSymbol,
    strokeWidth: (lineWidth) => 2 * lineWidth
  },
  comparator: {
    body: comparatorBodySymbol,
    accent: (width, height) => comparatorAccentSymbol(width, height),
    strokeWidth: (lineWidth) => 2 * lineWidth
  },
  slicer: {
    body: slicerBodySymbol,
    accent: (width, height) => slicerAccentSymbol(width, height),
    strokeWidth: (lineWidth) => 2 * lineWidth
  },
  differentialAmp: {
    body: differentialAmpBodySymbol,
    accent: differentialAmpLeadSymbol,
    strokeWidth: (lineWidth) => 2 * lineWidth
  },
  differentialOta: {
    body: differentialOtaBodySymbol,
    accent: differentialOtaLeadSymbol,
    strokeWidth: (lineWidth) => 2 * lineWidth
  },
  differentialComparator: {
    body: differentialComparatorBodySymbol,
    accent: (width, height) => differentialComparatorAccentSymbol(width, height),
    strokeWidth: (lineWidth) => 2 * lineWidth
  },
  inverter: {
    body: inverterSymbol,
    accent: inverterAccentSymbol,
    accentStrokeWidth: bufferAccentStrokeWidth
  },
  "inverter-variable": {
    body: variableInverterSymbol,
    accent: inverterAccentSymbol,
    accentStrokeWidth: bufferAccentStrokeWidth,
    marker: variableSymbolArrowMarkerSymbol
  },
  digitalBuffer: {
    body: digitalBufferSymbol,
    accent: digitalBufferTriangleSymbol,
    accentStrokeWidth: bufferAccentStrokeWidth
  },
  dff: {
    body: (width, height) => dffBodySymbol(width, height, DEFAULT_DFF_SETTINGS, DEFAULT_DFF_PIN_IDS),
    accent: (width, height) => dffAccentSymbol(width, height, DEFAULT_DFF_SETTINGS, DEFAULT_DFF_PIN_IDS),
    accentStrokeWidth: dffAccentStrokeWidth
  },
  analogBuffer: ANALOG_BUFFER_SYMBOL_DEFINITION,
  amp: ANALOG_BUFFER_SYMBOL_DEFINITION,
  singleInputGm: SINGLE_INPUT_AMPLIFIER_SYMBOL_DEFINITION,
  rectangle: {
    body: rectangleFrameSymbol,
    strokeWidth: (lineWidth) => 2 * lineWidth
  },
  triangle: {
    body: (width, height) => triangleFrameSymbol(width, height),
    strokeWidth: (lineWidth) => 2 * lineWidth
  },
  "analogBuffer-nonlinear": {
    body: analogBufferSymbol,
    accent: analogBufferNonlinearAccentSymbol,
    accentStrokeWidth: bufferAccentStrokeWidth
  },
  "function-block": {
    body: rectangleFrameSymbol,
    strokeWidth: (lineWidth) => 2 * lineWidth
  },
  annotation: { body: () => "" }
};

export function symbolPath(symbol: string, width: number, height: number) {
  const spnt = parseSpntSymbol(symbol);
  if (spnt) return spntSwitchSymbol(width, height, spnt.count, spnt.position);
  const definition = SYMBOL_DEFINITIONS[symbol];
  if (definition) return definition.body(width, height);
  if (parseLogicGateSymbol(symbol)) return logicGateSymbolBodyFromId(symbol, width, height);
  const mos = parseMosSymbol(symbol);
  if (mos) return mosfetBodySymbol(width, height, mos);
  const bjt = parseBjtSymbol(symbol);
  if (bjt) return bjtBodySymbol(width, height, bjt);
  return controlledSourceSymbol(width, height);
}

export function symbolAccentPath(symbol: string, width: number, height: number) {
  const accent = SYMBOL_DEFINITIONS[symbol]?.accent;
  if (accent) return accent(width, height);
  if (parseLogicGateSymbol(symbol)) return logicGateSymbolAccentFromId(symbol, width, height);
  const mos = parseMosSymbol(symbol);
  if (mos) return mosfetGateSymbol(width, height, SYMBOL_STROKE_WIDTH, mos.thickGate);
  if (parseBjtSymbol(symbol)) return bjtBaseSymbol(width, height);
  return "";
}

export function symbolAccentStrokeWidth(symbol: string, lineWidth = SYMBOL_STROKE_WIDTH) {
  const strokeWidth = SYMBOL_DEFINITIONS[symbol]?.accentStrokeWidth;
  if (strokeWidth) return strokeWidth(lineWidth);
  if (parseLogicGateSymbol(symbol)) return logicGateAccentStrokeWidth(lineWidth);
  if (parseMosSymbol(symbol) || parseBjtSymbol(symbol)) return 2 * lineWidth;
  return lineWidth;
}

export function symbolMarkerPath(symbol: string, width: number, height: number) {
  const marker = SYMBOL_DEFINITIONS[symbol]?.marker;
  if (marker) return marker(width, height);
  const mos = parseMosSymbol(symbol);
  if (mos) return mosfetMarkerSymbol(width, height, mos);
  const bjt = parseBjtSymbol(symbol);
  return bjt ? bjtMarkerSymbol(width, height, bjt) : "";
}

export function symbolStrokeWidth(symbol: string, lineWidth = SYMBOL_STROKE_WIDTH) {
  const strokeWidth = SYMBOL_DEFINITIONS[symbol]?.strokeWidth;
  if (strokeWidth) return strokeWidth(lineWidth);
  return lineWidth;
}
