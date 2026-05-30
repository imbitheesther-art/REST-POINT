import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const GaugeChart = ({ value }) => {
  const data = [{ name: 'Progress', value, fill: '#8884d8' }];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadialBarChart
        cx="50%"
        cy="100%"
        innerRadius="80%"
        outerRadius="100%"
        startAngle={180}
        endAngle={0}
        barSize={20}
        data={data}
      >
        <RadialBar minAngle={15} background clockWise dataKey="value" />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default GaugeChart;
