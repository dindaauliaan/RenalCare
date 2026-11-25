"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LabMetricTab, LabTrendPoint } from "@/lib/labs/processing";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  index?: number;
  value?: number;
  dataLength: number;
  showBadge: boolean;
}

function LatestPointDot({ cx, cy, index, value, dataLength, showBadge }: CustomDotProps) {
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  const isLast = index === dataLength - 1;

  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#ffffff" stroke="#167d8d" strokeWidth={3.5} />
      {showBadge && isLast && typeof value === "number" && (
        <g transform={`translate(${cx - 28}, ${cy - 40})`}>
          <rect width={56} height={28} rx={8} fill="#0f5e6b" />
          <text
            x={28}
            y={18}
            fill="#ffffff"
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
          >
            {value}
          </text>
        </g>
      )}
    </g>
  );
}

export function TrendChart({
  data,
  metric,
  unit,
  domain,
}: {
  data: LabTrendPoint[];
  metric: LabMetricTab;
  unit: string;
  domain: [number, number];
}) {
  const isClient = useIsClient();
  const isEgfr = metric === "eGFR";

  return (
    <div
      className="chart-wrap"
      aria-label={`Grafik tren ${metric}`}
    >
      {!isClient ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 12,
            background: "#f8fafc",
          }}
        />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 26, right: 20, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="renalTrendArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#167d8d" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#167d8d" stopOpacity={0} />
              </linearGradient>
            </defs>

            {isEgfr && (
              <>
                <ReferenceArea y1={90} y2={domain[1]} fill="#dcfce7" fillOpacity={0.6} ifOverflow="extendDomain" />
                <ReferenceArea y1={60} y2={90} fill="#ecfccb" fillOpacity={0.55} ifOverflow="extendDomain" />
                <ReferenceArea y1={45} y2={60} fill="#fef9c3" fillOpacity={0.65} ifOverflow="extendDomain" />
                <ReferenceArea y1={30} y2={45} fill="#fef08a" fillOpacity={0.45} ifOverflow="extendDomain" />
                <ReferenceArea y1={15} y2={30} fill="#ffedd5" fillOpacity={0.65} ifOverflow="extendDomain" />
                <ReferenceArea y1={0} y2={15} fill="#fee2e2" fillOpacity={0.65} ifOverflow="extendDomain" />
              </>
            )}

            <CartesianGrid stroke="#cbd5e1" strokeDasharray="4 5" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#475569", fontSize: 11 }}
              dy={6}
            />
            <YAxis
              domain={domain}
              ticks={isEgfr ? [0, 30, 60, 90] : undefined}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#475569", fontSize: 11 }}
              width={44}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #d1d5db",
                fontSize: 13,
                boxShadow: "0 6px 18px rgba(30,41,59,0.08)",
              }}
              labelFormatter={(_label, payload) => {
                const point = payload?.[0]?.payload as LabTrendPoint | undefined;
                if (!point) return String(_label);
                return point.isAcuteIllness
                  ? `${point.fullDate} (Saat sakit akut)`
                  : point.fullDate;
              }}
              formatter={(val) => [`${val} ${unit}`, metric]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#167d8d"
              strokeWidth={3.5}
              fill="url(#renalTrendArea)"
              isAnimationActive={false}
              dot={(dotProps) => (
                <LatestPointDot
                  key={`dot-${dotProps.index}`}
                  cx={dotProps.cx}
                  cy={dotProps.cy}
                  index={dotProps.index}
                  value={dotProps.value}
                  dataLength={data.length}
                  showBadge={isEgfr}
                />
              )}
              activeDot={{ r: 7, fill: "#0f5e6b", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
