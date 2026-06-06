"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCLP, formatCompactCLP, formatNumber } from "@/lib/format";

const PALETTE = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#14b8a6",
];

const axisProps = {
  tick: { fontSize: 12, fill: "#64748b" },
  axisLine: false,
  tickLine: false,
};

function TooltipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-md">{children}</div>
  );
}

export function EmbudoChart({ data }: { data: { label: string; cantidad: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" {...axisProps} allowDecimals={false} />
        <YAxis type="category" dataKey="label" width={100} {...axisProps} />
        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.08)" }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipBox>
                <p className="font-medium text-foreground">{payload[0].payload.label}</p>
                <p className="text-muted-foreground">
                  {formatNumber(Number(payload[0].value))} postulaciones
                </p>
              </TooltipBox>
            ) : null
          }
        />
        <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} barSize={22}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function IngresosChart({ data }: { data: { mes: string; ingresos: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="ingresosFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="mes" {...axisProps} />
        <YAxis {...axisProps} width={48} tickFormatter={(v) => formatCompactCLP(Number(v))} />
        <Tooltip
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipBox>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-muted-foreground">{formatCLP(Number(payload[0].value))}</p>
              </TooltipBox>
            ) : null
          }
        />
        <Area
          type="monotone"
          dataKey="ingresos"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#ingresosFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DonaChart({ data }: { data: { label: string; cantidad: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="cantidad"
          nameKey="label"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Legend
          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipBox>
                <p className="font-medium text-foreground">{payload[0].payload.label}</p>
                <p className="text-muted-foreground">{formatNumber(Number(payload[0].value))}</p>
              </TooltipBox>
            ) : null
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BarrasMontoChart({
  data,
}: {
  data: { label: string; valor: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <XAxis dataKey="label" {...axisProps} interval={0} angle={-20} textAnchor="end" height={70} />
        <YAxis {...axisProps} width={48} tickFormatter={(v) => formatCompactCLP(Number(v))} />
        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.08)" }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipBox>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-muted-foreground">{formatCLP(Number(payload[0].value))}</p>
              </TooltipBox>
            ) : null
          }
        />
        <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={36}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
