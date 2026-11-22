import { fixtureDocument } from "./fixtureDocument";
import { getComponentDef } from "../../../src/schematic/catalog";
import { instantiateSchematicTemplate, type SchematicTemplateId } from "../../../src/schematic/templates";
import type { ComponentInstance, ComponentType, Point, SchematicDocument, SchematicNote, Wire, WireAppearance } from "../../../src/schematic/types";

const TEMPLATE_REF_PREFIXES: Record<ComponentType, string> = {
  gnd: "GND",
  vdd: "VDD",
  antenna: "ANT",
  resistor: "R",
  capacitor: "C",
  inductor: "L",
  diode: "D",
  impedance: "Z",
  voltageSource: "V",
  currentSource: "I",
  battery: "V",
  iprobe: "IP",
  diffProbe: "VP",
  plus: "SUM",
  multiply: "MUL",
  adc: "ADC",
  dac: "DAC",
  vcvs: "A",
  vccs: "gm",
  cccs: "beta",
  ccvs: "Rm",
  opAmp: "Aop",
  ota: "Gm",
  comparator: "CMP",
  slicer: "SLC",
  diffAmp: "Ad",
  diffOta: "Gm",
  diffComparator: "DCMP",
  idealGm: "gm",
  inverter: "X",
  digitalBuffer: "X",
  and: "X",
  nand: "X",
  or: "X",
  nor: "X",
  xor: "X",
  xnor: "X",
  dff: "X",
  analogBuffer: "X",
  amp: "A",
  gm: "Gm",
  nmos: "M",
  pmos: "M",
  npn: "Q",
  pnp: "Q",
  switch: "S",
  spntSwitch: "S",
  transmissionGate: "TG",
  rectangle: "X",
  triangle: "X",
  integrator: "INT",
  differentiator: "DIF",
  delay: "DLY",
  filter: "FLT",
  annotation: "TXT"
};

export function fixtureComponent(type: ComponentType, ref: string, x: number, y: number, rotation = 0): ComponentInstance {
  const def = getComponentDef(type);
  const values = { ...(def.defaultValues ?? {}) };
  if (def.valueKey === "main") values.main = ref;
  return {
    id: ref,
    type,
    variantId: def.defaultVariantId,
    ref,
    x,
    y,
    rotation,
    mirrored: false,
    values
  };
}

export function fixtureWire(id: string, points: Point[], appearance?: WireAppearance): Wire {
  return {
    id,
    routeMode: "orthogonal",
    points: points.map((point) => ({ ...point })),
    appearance
  };
}

export function fixtureNote(id = "note-1", x = 220, y = 260): SchematicNote {
  return {
    id,
    x,
    y,
    width: 120,
    height: 60,
    format: "plain",
    text: "rewrite note",
    backgroundColor: "#fff6bf",
    fontSizePx: 14
  };
}

export function emptyDoc(): SchematicDocument {
  return fixtureDocument({

    junctionAppearances: [],
    netLabels: [],
    notes: [],
    components: [],
    wires: [],
    junctions: []
  });
}

export function twoResistorsStraightWireDoc(): SchematicDocument {
  return fixtureDocument({

    junctionAppearances: [],
    netLabels: [],
    notes: [],
    components: [fixtureComponent("resistor", "R1", 200, 200), fixtureComponent("resistor", "R2", 360, 200)],
    wires: [fixtureWire("w-r1-r2", [{ x: 240, y: 200 }, { x: 320, y: 200 }])],
    junctions: []
  });
}

export function twoResistorsLWireDoc(): SchematicDocument {
  return fixtureDocument({

    junctionAppearances: [],
    netLabels: [],
    notes: [],
    components: [fixtureComponent("resistor", "R1", 200, 200), fixtureComponent("resistor", "R2", 360, 280)],
    wires: [fixtureWire("w-r1-r2-l", [{ x: 240, y: 200 }, { x: 320, y: 200 }, { x: 320, y: 280 }])],
    junctions: []
  });
}

export function mixedSelectionDoc(): SchematicDocument {
  return fixtureDocument({
    junctionAppearances: [],
    netLabels: [],
    components: [fixtureComponent("resistor", "R1", 200, 200), fixtureComponent("capacitor", "C1", 360, 200, 90)],
    wires: [fixtureWire("w-mixed", [{ x: 240, y: 200 }, { x: 320, y: 200 }], { variant: "wide" })],
    junctions: [{ x: 280, y: 200 }],

    notes: [fixtureNote()]
  }, { joinAt: [{ x: 280, y: 200 }] });
}

export function tempDeletedDoc(): SchematicDocument {
  return fixtureDocument({

    junctionAppearances: [],
    netLabels: [],
    notes: [],
    components: [
      { ...fixtureComponent("resistor", "R1", 40, 0), temporarilyDeleted: true },
      fixtureComponent("gnd", "GND1", 80, 20)
    ],
    wires: [
      { ...fixtureWire("grounded", [{ x: 80, y: 0 }, { x: 0, y: 0 }]), temporarilyDeleted: true }
    ],
    junctions: []
  });
}

export function crossAndTJunctionDoc(): SchematicDocument {
  return fixtureDocument({

    junctionAppearances: [],
    netLabels: [],
    notes: [],
    components: [],
    junctions: [],
    wires: [
      fixtureWire("h", [{ x: 0, y: 0 }, { x: 120, y: 0 }]),
      fixtureWire("bare-cross", [{ x: 40, y: -40 }, { x: 40, y: 40 }]),
      fixtureWire("branch", [{ x: 80, y: 0 }, { x: 80, y: 40 }])
    ]
  });
}

function templateDoc(id: SchematicTemplateId, anchor: Point): SchematicDocument {
  const counters = new Map<ComponentType, number>();
  return instantiateSchematicTemplate(id, anchor, {
    createId: (kind, index) => `${id}-${kind}-${index}`,
    nextRef: (type) => {
      const next = (counters.get(type) ?? 0) + 1;
      counters.set(type, next);
      return `${TEMPLATE_REF_PREFIXES[type]}${next}`;
    }
  });
}

export function templateCommonSourceDoc(): SchematicDocument {
  return templateDoc("common_source_nmos", { x: 200, y: 200 });
}

export function templateFlippedAmpDiffDoc(): SchematicDocument {
  return templateDoc("flipped_amp_diff", { x: 320, y: 260 });
}
