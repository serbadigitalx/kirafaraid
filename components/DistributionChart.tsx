import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { HeirShare } from '../types';

interface DistributionChartProps {
  data: HeirShare[];
}

const COLORS = ['#0D4F4F', '#1A7A7A', '#2D9F9F', '#C8A951', '#E5C76B', '#78716C', '#A3836A', '#D4C4A8'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-warm-200 shadow-xl rounded-lg text-sm">
        <p className="font-bold text-teal-800">{payload[0].name}</p>
        <p className="text-warm-600">Pecahan: {payload[0].payload.fraction}</p>
        <p className="text-teal-600 font-semibold">RM {payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
  const chartData = data.map(d => ({
    name: d.type,
    value: d.amount,
    fraction: d.shareFraction
  }));

  // Filter out zero values for cleaner chart
  const activeData = chartData.filter(d => d.value > 0);

  return (
    <div className="h-[350px] w-full bg-white p-4 rounded-2xl border border-warm-200 shadow-sm flex flex-col items-center justify-center">
      <h3 className="text-lg font-semibold text-warm-800 mb-4 self-start font-display">Visual Pembahagian</h3>
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {activeData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DistributionChart;
