"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type DataPoint = {
  total_users: number;
  new_users: number;
  captured_at: string;
};

export function UserChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map((d) => ({
    date: new Date(d.captured_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    users: d.total_users,
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--ink-3)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--ink-3)" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "var(--ink-1)",
              border: "none",
              borderRadius: 8,
              color: "white",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#userGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
