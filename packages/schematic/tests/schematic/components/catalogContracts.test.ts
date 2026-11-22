import { fixtureDocument } from "../support/fixtureDocument";
import { describe, expect, it } from "vitest";
import {
  resolveComponentAnalysisModel,
  type AnalysisModel
} from "../../../src/schematic/analysis/componentAnalysisRegistry";
import { extractNetlist } from "../../../src/schematic/netlist";
import { transformPin } from "../../../src/schematic/geometry";
import { COMPONENT_CATALOG, getComponentDef, getComponentVariants, resolveComponentDef } from "../../../src/schematic/catalog";
import {
  CONVERTER_BITS_VALUE_KEY,
  DEFAULT_CONVERTER_BITS,
  DEFAULT_QUANTIZER_LEVELS,
  converterBitsLabel,
  quantizerLevelCount
} from "../../../src/schematic/converterModel";
import { COMPONENT_CLOCK_VALUE_KEY } from "../../../src/schematic/clockModel";
import { renderComponentSvg } from "../../../src/schematic/componentSvgRenderer";
import { makeComponentCell } from "../../../src/schematic/renderer";
import { polarityMark, SYMBOL_STROKE_WIDTH } from "../../../src/schematic/symbols/symbolPrimitives";
import {
  CONVERTER_LABEL_FONT_SIZE,
  CONVERTER_QUANTIZER_LABEL_FONT_SIZE,
  CONVERTER_VALUE_LABEL_FONT_SIZE,
  adcPentagonSymbol,
  adcQuantizerSymbol,
  adcSymbol,
  converterClockLeadSymbol,
  converterLabelPosition,
  converterLabelFontSize,
  multiplyAccentSymbol,
  multiplySymbol,
  operatorSymbol,
  converterLabelText,
  converterPentagonStrokeWidth,
  dacPentagonSymbol,
  dacSymbol,
  plusAccentSymbol,
  plusPinRoleSymbols,
  plusSymbol,
  quantizerTransferStaircaseSymbol,
  slicerAccentSymbol,
  slicerBodySymbol,
  voltageSourceSymbol
} from "../../../src/schematic/symbols/symbolBuilders";
import {
  symbolAccentPath,
  symbolAccentStrokeWidth,
  symbolPath,
  symbolStrokeWidth
} from "../../../src/schematic/symbols/symbolRegistry";
import { SYMBOL_GRID_SIZE, type ComponentType } from "../../../src/schematic/types";
import { component } from "../support/testHelpers";

function analysisModel(type: ComponentType, variantId?: string) {
  const instance = component(type, `${type}1`, 0, 0);
  instance.variantId = variantId;
  return resolveComponentAnalysisModel(instance);
}

const EXPECTED_ANALYSIS_MODELS: Readonly<Record<ComponentType, AnalysisModel>> = {
  gnd: "ground",
  vdd: "annotation",
  antenna: "blackBox",
  resistor: "resistor",
  capacitor: "capacitor",
  inductor: "inductor",
  diode: "blackBox",
  impedance: "impedance",
  voltageSource: "voltageSource",
  currentSource: "currentSource",
  battery: "voltageSource",
  iprobe: "annotation",
  diffProbe: "annotation",
  plus: "annotation",
  multiply: "annotation",
  adc: "annotation",
  dac: "annotation",
  vcvs: "vcvs",
  vccs: "vccs",
  cccs: "cccs",
  ccvs: "ccvs",
  opAmp: "opAmp",
  ota: "ota",
  comparator: "annotation",
  slicer: "annotation",
  diffAmp: "diffAmp",
  diffOta: "diffOta",
  diffComparator: "annotation",
  idealGm: "idealGm",
  inverter: "annotation",
  digitalBuffer: "annotation",
  and: "annotation",
  nand: "annotation",
  or: "annotation",
  nor: "annotation",
  xor: "annotation",
  xnor: "annotation",
  dff: "annotation",
  analogBuffer: "annotation",
  amp: "annotation",
  gm: "annotation",
  nmos: "mosfet",
  pmos: "mosfet",
  npn: "bjt",
  pnp: "bjt",
  switch: "annotation",
  spntSwitch: "annotation",
  transmissionGate: "blackBox",
  rectangle: "blackBox",
  triangle: "blackBox",
  integrator: "blackBox",
  differentiator: "blackBox",
  delay: "blackBox",
  filter: "blackBox",
  annotation: "annotation"
};

describe("schematic catalog contracts", () => {
  it("keeps the Web analysis registry exhaustive across every type and variant", () => {
    (Object.keys(COMPONENT_CATALOG) as ComponentType[]).forEach((type) => {
      const expected = EXPECTED_ANALYSIS_MODELS[type];
      expect(analysisModel(type), type).toBe(expected);
      getComponentVariants(type).forEach((variant) => {
        expect(analysisModel(type, variant.id), `${type}:${variant.id}`).toBe(expected);
      });
    });
  });

  it("keeps two-terminal component geometry unified", () => {
    const resistor = getComponentDef("resistor");
    const capacitor = getComponentDef("capacitor");
    const inductor = getComponentDef("inductor");
    const impedance = getComponentDef("impedance");
    const battery = getComponentDef("battery");
    const iprobe = getComponentDef("iprobe");
    const diffProbe = getComponentDef("diffProbe");
    expect(capacitor.size).toEqual(resistor.size);
    expect(inductor.size).toEqual(resistor.size);
    expect(impedance.size).toEqual(resistor.size);
    expect(battery.size).toEqual(resistor.size);
    expect(iprobe.size).toEqual(resistor.size);
    expect(diffProbe.size).toEqual(resistor.size);
    expect(capacitor.pins.map((pin) => ({ x: pin.x, y: pin.y }))).toEqual(resistor.pins.map((pin) => ({ x: pin.x, y: pin.y })));
    expect(inductor.pins.map((pin) => ({ x: pin.x, y: pin.y }))).toEqual(resistor.pins.map((pin) => ({ x: pin.x, y: pin.y })));
    expect(impedance.pins.map((pin) => ({ x: pin.x, y: pin.y }))).toEqual(resistor.pins.map((pin) => ({ x: pin.x, y: pin.y })));
    expect(battery.pins.map((pin) => ({ x: pin.x, y: pin.y }))).toEqual(resistor.pins.map((pin) => ({ x: pin.x, y: pin.y })));
    expect(iprobe.pins.map((pin) => ({ x: pin.x, y: pin.y }))).toEqual(resistor.pins.map((pin) => ({ x: pin.x, y: pin.y })));
    expect(diffProbe.pins.map((pin) => ({ x: pin.x, y: pin.y }))).toEqual(resistor.pins.map((pin) => ({ x: pin.x, y: pin.y })));
    expect(analysisModel("impedance")).toBe("impedance");
    expect(impedance.valuePrefix).toBe("Z");
    expect(analysisModel("battery")).toBe("voltageSource");
    expect(battery.valuePrefix).toBe("V");
    expect(analysisModel("iprobe")).toBe("annotation");
    expect(iprobe.valuePrefix).toBe("IP");
    expect(analysisModel("diffProbe")).toBe("annotation");
    expect(diffProbe.valuePrefix).toBe("VP");
  });

  it("declares editable scalar values and units independently from reference prefixes", () => {
    const scalarFields: Partial<Record<ComponentType, { label: string; unit?: string }>> = {
      resistor: { label: "Resistance", unit: "Ω" },
      capacitor: { label: "Capacitance", unit: "F" },
      inductor: { label: "Inductance", unit: "H" },
      impedance: { label: "Impedance", unit: "Ω" },
      vdd: { label: "Voltage", unit: "V" },
      voltageSource: { label: "Voltage", unit: "V" },
      currentSource: { label: "Current", unit: "A" },
      battery: { label: "Voltage", unit: "V" },
      adc: { label: "Bits", unit: "b" },
      dac: { label: "Bits", unit: "b" },
      vcvs: { label: "Gain" },
      vccs: { label: "Transconductance", unit: "S" },
      cccs: { label: "Gain" },
      ccvs: { label: "Transresistance", unit: "Ω" },
      opAmp: { label: "Gain" },
      ota: { label: "Transconductance", unit: "S" },
      comparator: { label: "Levels" },
      slicer: { label: "Levels" },
      diffAmp: { label: "Gain" },
      diffOta: { label: "Transconductance", unit: "S" },
      diffComparator: { label: "Levels" },
      idealGm: { label: "Transconductance", unit: "S" },
      amp: { label: "Gain" },
      gm: { label: "Transconductance", unit: "S" },
      spntSwitch: { label: "Position (0 = open)" },
      integrator: { label: "Gain" },
      differentiator: { label: "Gain" },
      delay: { label: "Value" },
      annotation: { label: "Text" }
    };
    const scalarTypes = Object.keys(scalarFields) as ComponentType[];
    const noScalarTypes = (Object.keys(COMPONENT_CATALOG) as ComponentType[]).filter((type) => !scalarFields[type]);

    scalarTypes.forEach((type) => {
      const def = getComponentDef(type);
      const expectedValueKey = type === "comparator" || type === "diffComparator" || type === "slicer"
        ? "levels"
        : type === "adc" || type === "dac"
          ? CONVERTER_BITS_VALUE_KEY
          : type === "integrator" || type === "differentiator" ? "gain"
          : type === "delay" ? "delay"
          : type === "spntSwitch" ? "switchPosition" : "main";
      expect(def.valueKey, type).toBe(expectedValueKey);
      expect(def.valueLabel, type).toBe(scalarFields[type]?.label);
      expect(def.valueUnit, type).toBe(scalarFields[type]?.unit);
    });
    expect(noScalarTypes).toEqual([
      "gnd",
      "antenna",
      "diode",
      "iprobe",
      "diffProbe",
      "plus",
      "multiply",
      "filter",
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
      "nmos",
      "pmos",
      "npn",
      "pnp",
      "switch",
      "transmissionGate",
      "rectangle",
      "triangle"
    ]);
    noScalarTypes.forEach((type) => {
      expect(getComponentDef(type).valueKey, type).toBeUndefined();
      expect(getComponentDef(type).valueUnit, type).toBeUndefined();
    });
  });

  it("renders the four-pin plus element with exact a-based geometry", () => {
    const plus = getComponentDef("plus");
    const a = SYMBOL_STROKE_WIDTH;
    const cx = plus.size.width / 2;
    const cy = plus.size.height / 2;
    const circleInnerDiameter = 24 * a;
    const circleOuterDiameter = 28 * a;
    const circleRadius = (circleInnerDiameter + circleOuterDiameter) / 4;
    const markHalfLength = 8 * a;

    expect(plus).toMatchObject({
      label: "+",
      hotLabel: "plus",
      terminalClass: "fourTerminal",
      valuePrefix: "SUM",
      editablePinVisibility: true,
      editablePinMode: true,
      defaultValues: {
        "pinVisible:top": "false",
        "pinMode:left": "positive",
        "pinMode:top": "positive",
        "pinMode:right": "output",
        "pinMode:bottom": "negative"
      },
      size: { width: 80, height: 80 },
      symbol: "plus"
    });
    expect(analysisModel("plus")).toBe("annotation");
    expect(plus.pins.map(({ id, role, x, y }) => ({ id, role, x, y }))).toEqual([
      { id: "left", role: "in", x: -40, y: 0 },
      { id: "top", role: "in", x: 0, y: -40 },
      { id: "right", role: "out", x: 40, y: 0 },
      { id: "bottom", role: "in", x: 0, y: 40 }
    ]);
    expect(plusSymbol(plus.size.width, plus.size.height)).toBe(
      `M 0 ${cy} L ${cx - circleRadius} ${cy} M ${cx} 0 L ${cx} ${cy - circleRadius} M ${cx + circleRadius} ${cy} L 80 ${cy} M ${cx} ${cy + circleRadius} L ${cx} 80`
    );
    expect(plusAccentSymbol(plus.size.width, plus.size.height)).toBe(
      `M ${cx + circleRadius} ${cy} A ${circleRadius} ${circleRadius} 0 1 1 ${cx - circleRadius} ${cy} A ${circleRadius} ${circleRadius} 0 1 1 ${cx + circleRadius} ${cy} M ${cx - markHalfLength} ${cy} L ${cx + markHalfLength} ${cy} M ${cx} ${cy - markHalfLength} L ${cx} ${cy + markHalfLength}`
    );
    const plusCell = makeComponentCell(component("plus", "SUM1", 100, 120));
    expect(plusCell.attr("symbolBody/d")).toBe(
      plusSymbol(plus.size.width, plus.size.height, a, new Set(["left", "right", "bottom"]))
    );
    expect(plusCell.attr("symbolBody/strokeWidth")).toBe(a);
    expect(plusCell.attr("symbolAccent/strokeWidth")).toBe(2 * a);
    expect(plusCell.attr("symbolPinMarks/strokeWidth")).toBe(a);
    const defaultPinMarks = plusPinRoleSymbols(plus.size.width, plus.size.height, new Map([
      ["left", { mode: "positive", symbolVisible: true, visible: true }],
      ["top", { mode: "positive", symbolVisible: true, visible: false }],
      ["right", { mode: "output", symbolVisible: true, visible: true }],
      ["bottom", { mode: "negative", symbolVisible: true, visible: true }]
    ]));
    expect(plusCell.attr("symbolPinMarks/d")).toBe(defaultPinMarks);

    const configuredPins = component("plus", "SUMCFG", 100, 120);
    configuredPins.values["pinVisible:top"] = "true";
    configuredPins.values["pinMode:left"] = "output";
    configuredPins.values["pinMode:top"] = "negative";
    configuredPins.values["pinSymbolVisible:bottom"] = "false";
    const configuredCell = makeComponentCell(configuredPins);
    expect(configuredCell.attr("symbolPinMarks/d")).toBe(
      polarityMark("minus", cx - 8 * a, (cy - circleRadius) / 2, 3 * a)
    );

    const netlist = extractNetlist(fixtureDocument({

      junctionAppearances: [],
      netLabels: [],
      notes: [], components: [configuredPins], wires: [], junctions: [] }));
    expect(netlist.pins.map(({ pinId, pinRole }) => ({ pinId, pinRole }))).toEqual([
      { pinId: "left", pinRole: "out" },
      { pinId: "top", pinRole: "n" },
      { pinId: "right", pinRole: "out" },
      { pinId: "bottom", pinRole: "n" }
    ]);

    const hiddenPins = component("plus", "SUM2", 100, 120);
    hiddenPins.values["pinVisible:top"] = "false";
    hiddenPins.values["pinVisible:right"] = "false";
    const hiddenCell = makeComponentCell(hiddenPins);
    expect(hiddenCell.attr("symbolBody/d")).toBe(
      plusSymbol(plus.size.width, plus.size.height, a, new Set(["left", "bottom"]))
    );
    expect(hiddenCell.attr("symbolAccent/d")).toBe(plusCell.attr("symbolAccent/d"));
    const hiddenPortItems = hiddenCell.prop("ports/items") as Array<{ id: string; attrs: { portBody: Record<string, unknown> } }>;
    expect(hiddenPortItems.find((pin) => pin.id === "left")?.attrs.portBody).toEqual({ title: "Left" });
    expect(hiddenPortItems.find((pin) => pin.id === "top")).toBeUndefined();
    expect(hiddenPortItems.find((pin) => pin.id === "right")).toBeUndefined();
  });

  it("renders multiply with shared operator geometry and fixed input/output pins", () => {
    const multiply = getComponentDef("multiply");
    const plus = getComponentDef("plus");
    const a = SYMBOL_STROKE_WIDTH;
    const cx = multiply.size.width / 2;
    const cy = multiply.size.height / 2;
    const circleRadius = 13 * a;
    const markHalfLength = 8 * a;

    expect(multiply).toMatchObject({
      label: "×",
      hotLabel: "multiply",
      terminalClass: "fourTerminal",
      valuePrefix: "MUL",
      editablePinVisibility: true,
      defaultValues: { "pinVisible:top": "false" },
      size: { width: 80, height: 80 },
      symbol: "multiply"
    });
    expect(multiply.editablePinMode).toBeUndefined();
    expect(analysisModel("multiply")).toBe("annotation");
    expect(multiply.pins).toEqual(plus.pins);
    expect(multiplySymbol(multiply.size.width, multiply.size.height)).toBe(
      operatorSymbol(multiply.size.width, multiply.size.height)
    );
    expect(multiplyAccentSymbol(multiply.size.width, multiply.size.height)).toBe(
      `M ${cx + circleRadius} ${cy} A ${circleRadius} ${circleRadius} 0 1 1 ${cx - circleRadius} ${cy} A ${circleRadius} ${circleRadius} 0 1 1 ${cx + circleRadius} ${cy} M ${cx - markHalfLength} ${cy - markHalfLength} L ${cx + markHalfLength} ${cy + markHalfLength} M ${cx - markHalfLength} ${cy + markHalfLength} L ${cx + markHalfLength} ${cy - markHalfLength}`
    );

    const instance = component("multiply", "MUL1", 100, 120);
    const cell = makeComponentCell(instance);
    expect(cell.attr("symbolBody/d")).toBe(
      operatorSymbol(multiply.size.width, multiply.size.height, a, new Set(["left", "right", "bottom"]))
    );
    expect(cell.attr("symbolAccent/d")).toBe(multiplyAccentSymbol(multiply.size.width, multiply.size.height));
    expect(cell.attr("symbolPinMarks/d")).toBe("");

    const netlist = extractNetlist(fixtureDocument({

      junctionAppearances: [],
      netLabels: [],
      notes: [],
      components: [instance],
      wires: [],
      junctions: []
    }));
    expect(netlist.pins.map(({ pinId, pinRole }) => ({ pinId, pinRole }))).toEqual([
      { pinId: "left", pinRole: "in" },
      { pinId: "right", pinRole: "out" },
      { pinId: "bottom", pinRole: "in" }
    ]);
  });

    const a = SYMBOL_STROKE_WIDTH;
  it("renders ADC and DAC as two-pin pentagons with 2a body strokes", () => {

    const adc = getComponentDef("adc");
    const dac = getComponentDef("dac");
    const cx = adc.size.width / 2;
    const cy = adc.size.height / 2;
    const leftApexX = cx - 13 * a;
    const leftShoulderX = cx - 7 * a;
    const leftX = cx - 11 * a;
    const rightShoulderX = cx + 7 * a;
    const rightApexX = cx + 13 * a;
    const rightX = cx + 11 * a;
    const topY = cy - SYMBOL_GRID_SIZE;
    const bottomY = cy + SYMBOL_GRID_SIZE;
    const expectedAdcLeads = `M ${cx - 40} ${cy} L ${leftApexX} ${cy} M ${rightX} ${cy} L ${cx + 40} ${cy}`;
    const expectedQuantizerStaircase =
      `M ${cx - 6 * a} ${cy + 4.5 * a} L ${cx - 3 * a} ${cy + 4.5 * a} L ${cx - 3 * a} ${cy + 1.5 * a} `
      + `L ${cx} ${cy + 1.5 * a} L ${cx} ${cy - 1.5 * a} L ${cx + 3 * a} ${cy - 1.5 * a} `
      + `L ${cx + 3 * a} ${cy - 4.5 * a} L ${cx + 6 * a} ${cy - 4.5 * a}`;
    const expectedAdcPentagon = `M ${leftApexX} ${cy} L ${leftShoulderX} ${topY} L ${rightX} ${topY} L ${rightX} ${bottomY} L ${leftShoulderX} ${bottomY} Z`;
    const expectedDacLeads = `M ${cx - 40} ${cy} L ${leftX} ${cy} M ${rightApexX} ${cy} L ${cx + 40} ${cy}`;
    const expectedDacPentagon = `M ${leftX} ${topY} L ${rightShoulderX} ${topY} L ${rightApexX} ${cy} L ${rightShoulderX} ${bottomY} L ${leftX} ${bottomY} Z`;

    [adc, dac].forEach((def) => {
      expect(def).toMatchObject({
        terminalClass: "twoTerminal",
        valueKey: CONVERTER_BITS_VALUE_KEY,
        valueLabel: "Bits",
        valuePlaceholder: DEFAULT_CONVERTER_BITS,
        valueUnit: "b",
        defaultValues: { [CONVERTER_BITS_VALUE_KEY]: DEFAULT_CONVERTER_BITS },
        defaultLabelVisible: false,
        size: { width: 100, height: 80 }
      });
      expect(def.pins.map(({ id, role, x, y }) => ({ id, role, x, y }))).toEqual([
        { id: "in", role: "in", x: -40, y: 0 },
        { id: "out", role: "out", x: 40, y: 0 }
      ]);
      expect(symbolStrokeWidth(def.symbol)).toBe(a);
      expect(symbolAccentStrokeWidth(def.symbol)).toBe(2 * a);
      expect(analysisModel(def.type, def.defaultVariantId)).toBe("annotation");
    });

    expect(adcSymbol(adc.size.width, adc.size.height)).toBe(expectedAdcLeads);
    expect(adcQuantizerSymbol(adc.size.width, adc.size.height)).toBe(
      `${expectedAdcLeads} ${expectedQuantizerStaircase}`
    );
    expect(adcPentagonSymbol(adc.size.width, adc.size.height)).toBe(expectedAdcPentagon);
    expect(dacSymbol(dac.size.width, dac.size.height)).toBe(expectedDacLeads);
    expect(dacPentagonSymbol(dac.size.width, dac.size.height)).toBe(expectedDacPentagon);
    expect(symbolPath(adc.symbol, adc.size.width, adc.size.height)).toBe(expectedAdcLeads);
    expect(symbolAccentPath(adc.symbol, adc.size.width, adc.size.height)).toBe(expectedAdcPentagon);
    expect(symbolPath(dac.symbol, dac.size.width, dac.size.height)).toBe(expectedDacLeads);
    expect(symbolAccentPath(dac.symbol, dac.size.width, dac.size.height)).toBe(expectedDacPentagon);
    expect(getComponentVariants("adc").map(({ id, label, symbol }) => ({ id, label, symbol }))).toEqual([
      { id: "plain", label: "Plain", symbol: "adc" },
      { id: "quantizer", label: "Quantizer", symbol: "adc-quantizer" }
    ]);
    expect(getComponentVariants("dac")).toEqual([]);
    expect(converterPentagonStrokeWidth()).toBe(2 * a);
    expect(bottomY - topY).toBe(2 * SYMBOL_GRID_SIZE);
    expect(topY % SYMBOL_GRID_SIZE).toBe(0);
    expect(bottomY % SYMBOL_GRID_SIZE).toBe(0);
    expect(converterLabelText(adc.symbol)).toBe("ADC");
    expect(converterLabelText(dac.symbol)).toBe("DAC");
    expect(converterBitsLabel("3")).toBe("3b");
    expect(converterBitsLabel("k1")).toBe("k1 b");
    expect(converterLabelText(adc.symbol, "3")).toBe("3b\nADC");
    expect(converterLabelText(adc.symbol, "k1")).toBe("k1 b\nADC");
    expect(converterLabelText(dac.symbol, "k1")).toBe("k1 b\nDAC");
    expect(converterLabelText("adc-quantizer")).toBe("");
    expect(converterLabelText("adc-quantizer", "3")).toBe("3b ADC");
    expect(converterLabelFontSize(adc.symbol, "k1")).toBe(CONVERTER_VALUE_LABEL_FONT_SIZE);
    expect(converterLabelFontSize("adc-quantizer", "3")).toBe(CONVERTER_QUANTIZER_LABEL_FONT_SIZE);
    expect(converterLabelPosition(adc.symbol, adc.size.width, adc.size.height)).toEqual({ x: cx + a, y: cy });
    expect(converterLabelPosition(dac.symbol, dac.size.width, dac.size.height)).toEqual({ x: cx - a, y: cy });

    const adcCell = makeComponentCell(component("adc", "ADC1", 100, 120));
    const dacCell = makeComponentCell(component("dac", "DAC1", 100, 120));
    const quantizer = component("adc", "ADCQ", 100, 120);
    quantizer.variantId = "quantizer";
    const quantizerCell = makeComponentCell(quantizer);
    expect(adcCell.attr("symbolBody/strokeWidth")).toBe(a);
    expect(adcCell.attr("symbolAccent/strokeWidth")).toBe(2 * a);
    expect(adcCell.attr("label/text")).toBe("ADC");
    expect(adcCell.attr("label/opacity")).toBe(1);
    expect(adcCell.attr("refLabel/opacity")).toBe(0);
    expect(dacCell.attr("label/text")).toBe("DAC");
    expect(dacCell.attr("label/opacity")).toBe(1);
    expect(dacCell.attr("refLabel/opacity")).toBe(0);
    expect(quantizerCell.attr("symbolBody/d")).toBe(`${expectedAdcLeads} ${expectedQuantizerStaircase}`);
    expect(quantizerCell.attr("symbolBody/strokeWidth")).toBe(a);
    expect(quantizerCell.attr("symbolAccent/strokeWidth")).toBe(2 * a);
    expect(quantizerCell.attr("label/text")).toBe("");
    expect(quantizerCell.attr("label/opacity")).toBe(0);
    expect(adcCell.attr("label/fontSize")).toBe(CONVERTER_LABEL_FONT_SIZE);
    expect(dacCell.attr("label/fontSize")).toBe(CONVERTER_LABEL_FONT_SIZE);

    const clockLead = converterClockLeadSymbol(adc.size.width, adc.size.height);
    const clockedAdc = component("adc", "ADCclk", 100, 120);
    clockedAdc.values[COMPONENT_CLOCK_VALUE_KEY] = "rising";
    const clockedDac = component("dac", "DACclk", 100, 120);
    clockedDac.values[COMPONENT_CLOCK_VALUE_KEY] = "rising";
    const clockedQuantizer = component("adc", "ADCQclk", 100, 120);
    clockedQuantizer.variantId = "quantizer";
    clockedQuantizer.values[COMPONENT_CLOCK_VALUE_KEY] = "rising";
    [clockedAdc, clockedDac, clockedQuantizer].forEach((instance) => {
      const resolved = resolveComponentDef(instance);
      expect(resolved.terminalClass).toBe("threeTerminal");
      expect(resolved.pins.map(({ id, x, y }) => ({ id, x, y }))).toEqual([
        { id: "in", x: -40, y: 0 },
        { id: "out", x: 40, y: 0 },
        { id: "clk", x: 0, y: 40 }
      ]);
      expect(makeComponentCell(instance).attr("symbolBody/d")).toContain(clockLead);
    });
    expect(resolveComponentDef(clockedAdc).symbol).toBe("adc");
    expect(resolveComponentDef(clockedDac).symbol).toBe("dac");

    const valuedAdc = component("adc", "ADCV", 100, 120);
    const valuedDac = component("dac", "DACV", 100, 120);
    valuedAdc.values.valueVisible = "true";
    valuedDac.values.valueVisible = "true";
    const valuedAdcCell = makeComponentCell(valuedAdc);
    const valuedDacCell = makeComponentCell(valuedDac);
    expect(CONVERTER_VALUE_LABEL_FONT_SIZE).toBe(CONVERTER_LABEL_FONT_SIZE);
    expect(valuedAdcCell.attr("label/fontSize")).toBe(13);
    expect(valuedDacCell.attr("label/fontSize")).toBe(13);
    expect(valuedAdcCell.attr("label/text")).toBe("k1 b\nADC");
    expect(valuedAdcCell.attr("label/fontSize")).toBe(CONVERTER_VALUE_LABEL_FONT_SIZE);
    expect(valuedAdcCell.attr("label/lineHeight")).toBe("1em");
    expect(valuedAdcCell.attr("label/textVerticalAnchor")).toBe("middle");
    expect(valuedAdcCell.attr("refLabel/opacity")).toBe(0);
    expect(valuedDacCell.attr("label/text")).toBe("k1 b\nDAC");
    expect(valuedDacCell.attr("label/fontSize")).toBe(CONVERTER_VALUE_LABEL_FONT_SIZE);
    expect(valuedDacCell.attr("refLabel/opacity")).toBe(0);
    expect(renderComponentSvg(valuedAdc)).toMatch(
      /<tspan x="[^"]+" dy="-0\.2em">k1 b<\/tspan><tspan x="[^"]+" dy="1em">ADC<\/tspan>/
    );

    expect(quantizerLevelCount("1")).toBe(2);
    expect(quantizerLevelCount("3")).toBe(8);
    expect(quantizerLevelCount("5")).toBe(32);
    expect(quantizerLevelCount("6")).toBe(DEFAULT_QUANTIZER_LEVELS);
    expect(quantizerLevelCount("k1")).toBe(DEFAULT_QUANTIZER_LEVELS);
    expect((quantizerTransferStaircaseSymbol(100, 40, a, 8).match(/ L /g) ?? []))
      .toHaveLength(15);

    quantizer.values[CONVERTER_BITS_VALUE_KEY] = "3";
    expect(makeComponentCell(quantizer).attr("symbolBody/d")).toBe(
      adcQuantizerSymbol(adc.size.width, adc.size.height, a, new Set(["in", "out"]), 8)
    );
    quantizer.values.valueVisible = "true";
    const valuedQuantizerCell = makeComponentCell(quantizer);
    expect(valuedQuantizerCell.attr("symbolBody/d")).toBe(
      adcQuantizerSymbol(adc.size.width, adc.size.height, a, new Set(["in", "out"]), 8, true)
    );
    expect(valuedQuantizerCell.attr("label/text")).toBe("3b ADC");
    expect(valuedQuantizerCell.attr("label/fontSize")).toBe(CONVERTER_QUANTIZER_LABEL_FONT_SIZE);
    quantizer.values[CONVERTER_BITS_VALUE_KEY] = "6";
    quantizer.values.valueVisible = "false";
    expect(makeComponentCell(quantizer).attr("symbolBody/d")).toBe(
      adcQuantizerSymbol(
        adc.size.width,
        adc.size.height,
        a,
        new Set(["in", "out"]),
        DEFAULT_QUANTIZER_LEVELS
      )
    );

    const labeledAdc = component("adc", "ADC2", 100, 120);
    const labeledDac = component("dac", "DAC2", 100, 120);
    labeledAdc.values.labelVisible = "true";
    labeledDac.values.labelVisible = "true";
    const labeledAdcCell = makeComponentCell(labeledAdc);
    const labeledDacCell = makeComponentCell(labeledDac);
    expect(labeledAdcCell.attr("label/text")).toBe("ADC");
    expect(labeledAdcCell.attr("label/opacity")).toBe(1);
    expect(labeledDacCell.attr("label/text")).toBe("DAC");
    expect(labeledDacCell.attr("label/opacity")).toBe(1);
  });

  it("offers DC and waveform voltage-source views with waveform amplitude fields", () => {
    expect(getComponentVariants("voltageSource").map(({ id, label, symbol }) => ({ id, label, symbol })))
      .toEqual([
        { id: "dc", label: "dc", symbol: "voltageSource" },
        { id: "sine", label: "sine", symbol: "voltageSource-sine" },
        { id: "pulse", label: "pulse", symbol: "voltageSource-square" },
        { id: "exp", label: "exp", symbol: "voltageSource-exp" },
        { id: "bit", label: "bit", symbol: "voltageSource-bit" },
        { id: "pwl", label: "pwl", symbol: "voltageSource-pwl" },
        { id: "ramp", label: "ramp", symbol: "voltageSource-ramp-up" },
        { id: "noise", label: "noise", symbol: "voltageSource-noise" }
      ]);
    const source = component("voltageSource", "V1", 100, 120);
    expect(resolveComponentDef(source).valueLabel).toBe("Voltage");
    ["sine", "pulse", "exp", "bit"].forEach((variantId) => {
      source.variantId = variantId;
      const def = resolveComponentDef(source);
      expect(def.valueLabel, variantId).toBe(variantId === "sine" ? "Amplitude 1 (Vpk)" : "One value");
      expect(symbolPath(def.symbol, def.size.width, def.size.height), variantId)
        .not.toBe(voltageSourceSymbol(def.size.width, def.size.height));
    });
  });

  it("can hide only the ADC output or DAC input pin and its lead", () => {
    const adc = component("adc", "ADC1", 100, 120);
    adc.values["pinVisible:out"] = "false";
    const dac = component("dac", "DAC1", 100, 120);
    dac.values["pinVisible:in"] = "false";
    const adcCell = makeComponentCell(adc);
    const dacCell = makeComponentCell(dac);

    expect(adcCell.getPort("in")).toBeTruthy();
    expect(adcCell.getPort("out")).toBeUndefined();
    expect(adcCell.attr("symbolBody/d")).not.toContain("L 90 20");
    expect(dacCell.getPort("out")).toBeTruthy();
    expect(dacCell.getPort("in")).toBeUndefined();
    expect(dacCell.attr("symbolBody/d")).not.toContain("M 10 20");
  });

  it("declares amplifier family catalog contracts explicitly", () => {
    const cases: Array<{
      type: ComponentType;
      analysisModel: AnalysisModel;
      terminalClass: string;
      valuePrefix: string;
      size: { width: number; height: number };
      symbol: string;
      pinIds: string[];
    }> = [
      {
        type: "opAmp",
        analysisModel: "opAmp",
        terminalClass: "threeTerminal",
        valuePrefix: "Aop",
        size: { width: 116, height: 92 },
        symbol: "opAmp",
        pinIds: ["inp", "inn", "out"]
      },
      {
        type: "ota",
        analysisModel: "ota",
        terminalClass: "threeTerminal",
        valuePrefix: "Gm",
        size: { width: 116, height: 92 },
        symbol: "ota",
        pinIds: ["inp", "inn", "out"]
      },
      {
        type: "diffAmp",
        analysisModel: "diffAmp",
        terminalClass: "fourTerminal",
        valuePrefix: "Ad",
        size: { width: 240, height: 176 },
        symbol: "differentialAmp",
        pinIds: ["inp", "inn", "outp", "outn"]
      },
      {
        type: "diffOta",
        analysisModel: "diffOta",
        terminalClass: "fourTerminal",
        valuePrefix: "Gm",
        size: { width: 240, height: 176 },
        symbol: "differentialOta",
        pinIds: ["inp", "inn", "outp", "outn"]
      }
    ];

    cases.forEach((item) => {
      const def = getComponentDef(item.type);
      expect(def.type, item.type).toBe(item.type);
      expect(analysisModel(item.type), item.type).toBe(item.analysisModel);
      expect(def.terminalClass, item.type).toBe(item.terminalClass);
      expect(def.valuePrefix, item.type).toBe(item.valuePrefix);
      expect(def.size, item.type).toEqual(item.size);
      expect(def.symbol, item.type).toBe(item.symbol);
      expect(def.pins.map((pin) => pin.id), item.type).toEqual(item.pinIds);
    });

    expect(getComponentDef("ota").pins.map((pin) => ({ id: pin.id, x: pin.x, y: pin.y }))).toEqual(
      getComponentDef("opAmp").pins.map((pin) => ({ id: pin.id, x: pin.x, y: pin.y }))
    );
    expect(getComponentDef("diffOta").pins.map((pin) => ({ id: pin.id, x: pin.x, y: pin.y }))).toEqual(
      getComponentDef("diffAmp").pins.map((pin) => ({ id: pin.id, x: pin.x, y: pin.y }))
    );
  });

  it("declares comparator catalog contracts with value-based clocks and level values", () => {
    const comparator = getComponentDef("comparator");
    const diffComparator = getComponentDef("diffComparator");
    const opAmp = getComponentDef("opAmp");
    const diffAmp = getComponentDef("diffAmp");

    expect(comparator).toMatchObject({
      type: "comparator",
      label: "CMP",
      hotLabel: "comparator",
      terminalClass: "threeTerminal",
      valueKey: "levels",
      valueLabel: "Levels",
      valuePlaceholder: "1",
      defaultValues: { levels: "1" },
      symbol: "comparator"
    });
    expect(analysisModel("comparator")).toBe("annotation");
    expect(diffComparator).toMatchObject({
      type: "diffComparator",
      label: "DCMP",
      hotLabel: "diffcomparator",
      terminalClass: "fourTerminal",
      valueKey: "levels",
      valueLabel: "Levels",
      valuePlaceholder: "1",
      defaultValues: { levels: "1" },
      symbol: "differentialComparator"
    });
    expect(analysisModel("diffComparator")).toBe("annotation");
    expect(comparator.pins.map((pin) => ({ id: pin.id, x: pin.x, y: pin.y }))).toEqual(
      opAmp.pins.map((pin) => ({ id: pin.id, x: pin.x, y: pin.y }))
    );
    expect(diffComparator.pins.map((pin) => ({ id: pin.id, x: pin.x, y: pin.y }))).toEqual(
      diffAmp.pins.map((pin) => ({ id: pin.id, x: pin.x, y: pin.y }))
    );
    expect(getComponentVariants("comparator")).toEqual([]);
    expect(getComponentVariants("diffComparator")).toEqual([]);
    const clocked = component("comparator", "CMP1", 0, 0);
    clocked.values.clock = "falling";
    expect(resolveComponentDef(clocked)).toMatchObject({
      symbol: "comparator",
      terminalClass: "fourTerminal"
    });
    expect(resolveComponentDef(clocked).pins.map((pin) => pin.id)).toEqual(["inp", "inn", "out", "clk"]);
  });

  it("declares a 2-by-2-grid square slicer with optional clocking", () => {
    const slicer = getComponentDef("slicer");
    const clocked = component("slicer", "SLC1", 100, 120);
    clocked.values.clock = "rising";
    const falling = component("slicer", "SLC2", 220, 120);
    falling.values.clock = "falling";
    const resolvedClocked = resolveComponentDef(clocked);
    const cell = makeComponentCell(clocked);
    const fallingCell = makeComponentCell(falling);

    expect(slicer).toMatchObject({
      type: "slicer",
      label: "SLC",
      hotLabel: "slicer",
      terminalClass: "twoTerminal",
      valuePrefix: "SLC",
      valueKey: "levels",
      valuePlaceholder: "1",
      defaultValues: { levels: "1" },
      size: { width: 80, height: 80 },
      symbol: "slicer"
    });
    expect(slicer.pins.map(({ id, role, x, y }) => ({ id, role, x, y }))).toEqual([
      { id: "in", role: "in", x: -40, y: 0 },
      { id: "out", role: "out", x: 40, y: 0 }
    ]);
    expect(getComponentVariants("slicer")).toEqual([]);
    expect(slicerBodySymbol(80, 80)).toBe("M 20 20 L 60 20 L 60 60 L 20 60 Z");
    expect(slicerAccentSymbol(80, 80)).toBe(
      "M 0 40 L 20 40 M 80 40 L 60 40 M 40 28 L 40 52 M 40 28 L 48 28 M 32 40 L 48 40 M 32 52 L 40 52"
    );
    expect(slicerAccentSymbol(80, 80, 1, "rising")).toBe(
      "M 0 40 L 20 40 M 80 40 L 60 40 M 40 60 L 40 80 M 40 28 L 40 52 M 40 28 L 48 28 M 32 40 L 48 40 M 32 52 L 40 52"
    );
    expect(symbolPath(slicer.symbol, 80, 80)).toBe(slicerBodySymbol(80, 80));
    expect(cell.attr("symbolAccent/d")).toBe(slicerAccentSymbol(80, 80, 1, "rising"));
    expect(symbolStrokeWidth(slicer.symbol)).toBe(2 * SYMBOL_STROKE_WIDTH);
    expect(symbolAccentStrokeWidth(slicer.symbol)).toBe(SYMBOL_STROKE_WIDTH);
    expect(resolvedClocked.pins.at(-1)).toMatchObject({ id: "clk", x: 0, y: 40 });
    expect(cell.attr("symbolBody/strokeWidth")).toBe(2 * SYMBOL_STROKE_WIDTH);
    expect(cell.attr("symbolAccent/strokeLinecap")).toBe("round");
    expect(fallingCell.attr("symbolClockBubble/d")).toContain("A 6 6");
    expect(fallingCell.attr("symbolClockBubble/strokeWidth")).toBe(2 * SYMBOL_STROKE_WIDTH);
    expect(analysisModel("slicer")).toBe("annotation");
  });

  it("transforms pins under rotation and mirroring", () => {
    const instance = component("resistor", "R1", 100, 100, 90);
    const pin = getComponentDef("resistor").pins[0];
    expect(transformPin(instance, pin)).toEqual({ x: 100, y: 60 });

    instance.mirrored = true;
    expect(transformPin(instance, pin)).toEqual({ x: 100, y: 140 });
  });
});
