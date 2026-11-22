import { describe, expect, it } from "vitest";
import { getComponentDef } from "../../../src/schematic/catalog";
import { ComponentRefAllocator } from "../../../src/schematic/componentRefAllocator";
import { makeComponentCell } from "../../../src/schematic/componentRenderer";
import { renderComponentSvg } from "../../../src/schematic/componentSvgRenderer";
import { paletteSymbolPreview } from "../../../src/schematic/instanceSelector";
import { componentPinPoint, extractNetlist } from "../../../src/schematic/netlist";
import { buildPlacedComponent } from "../../../src/schematic/placementModel";
import { parseSchematicDocumentFile, serializeSchematicDocumentFile } from "../../../src/schematic/schematicDocumentFile";
import { buildSchematicSelectionNetlist } from "../../../src/schematic/selection/selectionNetlist";
import { GRID_SIZE } from "../../../src/schematic/types";
import { fixtureDocument } from "../support/fixtureDocument";
import { fixtureComponent, fixtureWire } from "../support/fixtures";

function placeAntenna() {
  return buildPlacedComponent("antenna", { x: 200, y: 200 }, {
    id: "ant",
    ref: new ComponentRefAllocator().next("antenna"),
    rotation: 0,
    mirrored: false
  });
}

describe("antenna", () => {
  it("draws the same one-port symbol in the palette, on canvas, and in SVG", () => {
    const antenna = placeAntenna();
    const def = getComponentDef("antenna");
    const lead = "M 20 35 L 20 40";
    const body = "M 4 3 L 36 3 L 20 35 Z M 20 3 L 20 35";

    expect(antenna.ref).toBe("ANT1");
    expect(def.terminalClass).toBe("oneTerminal");
    expect(def.pins).toEqual([{ id: "port", label: "ANT", role: "io", x: 0, y: 20 }]);
    const cell = makeComponentCell(antenna);
    expect(cell.size()).toEqual({ width: 4 * GRID_SIZE, height: 4 * GRID_SIZE });
    expect(cell.attr("symbolBody/d")).toBe(lead);
    expect(cell.attr("symbolAccent/d")).toBe(body);
    for (const svg of [paletteSymbolPreview("antenna"), renderComponentSvg(antenna)]) {
      expect(svg).toContain(`d="${lead}"`);
      expect(svg).toContain(`d="${body}"`);
    }
  });

  it("retains a wired signal port through JSON and netlist export", () => {
    const antenna = placeAntenna();
    const resistor = fixtureComponent("resistor", "R1", 240, 250);
    expect(componentPinPoint(antenna, "port")).toEqual({ x: 200, y: 220 });
    const document = fixtureDocument({
      components: [antenna, resistor],
      wires: [fixtureWire("feed", [{ x: 200, y: 220 }, { x: 200, y: 250 }])]
    });

    const restored = parseSchematicDocumentFile(serializeSchematicDocumentFile(document));
    expect(restored.components[0]).toMatchObject({ id: "ant", type: "antenna", ref: "ANT1" });
    expect(restored.connections).toEqual(document.connections);
    const [antennaNet, resistorNet] = extractNetlist(restored).components;
    expect(antennaNet.pins.port).toBeTruthy();
    expect(antennaNet.pins.port).not.toBe("0");
    expect(antennaNet.pins).toEqual({ port: resistorNet.pins.p });
    expect(buildSchematicSelectionNetlist(restored, ["ant"])?.text)
      .toContain(`ANT1 (${antennaNet.pins.port}) antenna`);
  });
});
