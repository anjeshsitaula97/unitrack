export const entityFields: Record<string, string[]> = {
  Student: [
    "id",
    "name",
    "firstName",
    "lastName",
    "email",
    "phone",
    "nationality",
    "dob",
    "gender",
    "address",
    "status",
    "createdAt",
  ],
  University: [
    "id",
    "name",
    "country",
    "city",
    "type",
    "ranking",
    "founded",
    "status",
    "createdAt",
  ],
  Course: [
    "id",
    "name",
    "universityId",
    "faculty",
    "degreeType",
    "level",
    "duration",
    "credits",
    "tuitionFee",
    "language",
    "mode",
    "intake",
    "createdAt",
  ],
  Lead: ["id", "name", "email", "phone", "source", "status", "interestedCountry", "createdAt"],
  Payment: ["id", "amount", "currency", "status", "method", "date", "description", "createdAt"],
  Application: ["id", "status", "appliedDate", "createdAt"],
};

export const chartTypes = ["Table", "Bar", "Pie", "Line"];

export const filterOperators = ["contains", "equals", "gt", "lt", "startsWith"];

export const makeFilterId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `filter-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function readConfig(config: unknown): Record<string, unknown> {
  if (!config) return {};
  if (typeof config === "string") {
    try {
      const parsed = JSON.parse(config);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return typeof config === "object" ? (config as Record<string, unknown>) : {};
}

export function reportRowKey(row: Record<string, unknown>, fields: string[]) {
  return fields.map((f) => String(row[f] ?? "")).join("|");
}
