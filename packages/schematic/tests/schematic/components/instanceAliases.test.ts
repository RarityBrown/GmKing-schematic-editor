// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { InstanceSelector, type InstancePaletteItem } from "../../../src/schematic/instanceSelector";

describe("instance aliases in keyboard placement", () => {
  it.each([
    ["diode", "", "diode", "diode"],
    ["antenn", "a", "antenna", "antenna"],
    ["pass_g", "ate", "transmissionGate", "transmission_gate"],
    ["pass_gate", "", "transmissionGate", "transmission_gate"],
    ["NCH", "", "nmos", "nmos"],
    ["pch", "", "pmos", "pmos"]
  ])("previews and accepts %s with Tab", (query, completion, expected, canonicalName) => {
    const root = document.createElement("div");
    root.innerHTML = '<div data-palette-items></div>';
    document.body.append(root);
    let current: InstancePaletteItem = "resistor";
    let active: InstancePaletteItem | null = current;
    const activate = vi.fn((item: InstancePaletteItem) => { current = item; active = item; });
    const selector = new InstanceSelector(root, {
      currentItem: () => current, activeItem: () => active, isPlacementMode: () => true,
      activateItem: activate, previewItem: item => { active = item; }, onStatusChange: () => {}
    });
    try {
      selector.render();
      selector.bind();
      selector.beginPlacement("resistor", { armKeyboard: true });
      root.tabIndex = 0;
      root.focus();
      for (const key of query) selector.handleKeyboardCapture(new KeyboardEvent("keydown", { key }));
      expect(active).toBe(expected);
      expect(root.querySelector("[data-instance-query-ghost]")?.textContent).toBe(completion);
      expect(root.querySelectorAll(`[data-palette-item='${expected}']`)).toHaveLength(1);
      selector.handleKeyboardCapture(new KeyboardEvent("keydown", { key: "Tab" }));
      expect(activate).toHaveBeenCalledWith(expected, expect.anything());
      expect(root.querySelector<HTMLInputElement>("[data-instance-query]")!.value).toBe(canonicalName);
    } finally {
      selector.destroy();
      root.remove();
    }
  });
});
