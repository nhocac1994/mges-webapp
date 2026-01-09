'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface AreaChartProps {
  data: Array<{
    Area: string
    count: number
    percentage: number
  }>
}

const COLORS = ['#3b82f6', '#ef4444', '#06b6d4', '#f59e0b', '#10b981', '#fbbf24']

export default function AreaChart({ data }: AreaChartProps) {
  const chartData = data.map((item) => ({
    name: item.Area,
    value: item.count,
    percentage: item.percentage,
  }))

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
        Area with the highest number of issues
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

