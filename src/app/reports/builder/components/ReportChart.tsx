"use client";

import BarChart from "./BarChart";
import PieChart from "./PieChart";
import NoNumericField from "./NoNumericField";
import type { ReportChartProps } from "./types";

export default function ReportChart({ rows, fields, chartType }: ReportChartProps) {
  const numField = rows.length > 0 ? fields.find((f) => !isNaN(Number(rows[0][f]))) : undefined;

  if (!numField) {
    return <NoNumericField chartType={chartType} />;
  }

  if (chartType === "Bar" || chartType === "Line") {
    return <BarChart rows={rows} fields={fields} numField={numField} chartType={chartType} />;
  }

  return <PieChart rows={rows} fields={fields} numField={numField} />;
}
