import type { MaterializationLink } from "./materialization-repository";

export type MaterializationView = Omit<MaterializationLink, "ownerId">;

export function toMaterializationView(link: MaterializationLink): MaterializationView {
  const { ownerId, ...view } = link;
  void ownerId;
  return view;
}
