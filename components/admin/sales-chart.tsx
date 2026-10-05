"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export function SalesChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={70}
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            tickFormatter={(value: number) => formatCurrency(value)}
          />
          <Tooltip
            formatter={(value, name) => [
              name === "revenue" ? formatCurrency(Number(value)) : value,
              name === "revenue" ? "Revenue" : "Orders",
            ]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              fontSize: 12,
              boxShadow: "var(--shadow-md)",
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#4f46e5"
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
