export type EntityKind = "topic" | "problem";

export async function patchEntity(
  kind: EntityKind,
  id: number,
  data: Record<string, unknown>
): Promise<void> {
  await fetch(`/api/${kind}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
