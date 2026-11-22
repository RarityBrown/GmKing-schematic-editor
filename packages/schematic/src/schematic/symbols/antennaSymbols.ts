import { SYMBOL_GRID_SIZE } from "../types";
import { line, path } from "./symbolPrimitives";

const TIP_OFFSET = 15;

export function antennaLeadSymbol(width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  return line(cx, cy + TIP_OFFSET, cx, cy + SYMBOL_GRID_SIZE);
}

export function antennaBodySymbol(width: number, height: number) {
  const cx = width / 2;
  const top = height / 2 - 17;
  const tip = height / 2 + TIP_OFFSET;
  const halfWidth = 16;
  return path([
    `M ${cx - halfWidth} ${top} L ${cx + halfWidth} ${top} L ${cx} ${tip} Z`,
    line(cx, top, cx, tip)
  ]);
}
