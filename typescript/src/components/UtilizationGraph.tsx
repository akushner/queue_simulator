import { Box, Typography, Paper } from '@mui/material';
import { useSimulationStore } from '@/lib/simulation';

export function UtilizationGraph() {
  const utilizationHistory = useSimulationStore((state) => state.utilizationHistory);

  const width = 800;
  const height = 200;
  const padding = 40;

  const xScale = (index: number) => {
    return padding + (index / (utilizationHistory.length - 1)) * (width - 2 * padding);
  };

  const yScale = (value: number) => {
    return height - padding - (value / 100) * (height - 2 * padding);
  };

  const pathData = utilizationHistory
    .map((value, index) => {
      const x = xScale(index);
      const y = yScale(value);
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2, width: '100%' }}>
      <Typography variant="h6" gutterBottom>Host Utilization (%)</Typography>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((value) => (
            <g key={value}>
              <text x={padding - 10} y={yScale(value)} dy=".3em" textAnchor="end" fill="#888" fontSize="12">
                {value}
              </text>
              <line x1={padding} x2={width - padding} y1={yScale(value)} y2={yScale(value)} stroke="#eee" />
            </g>
          ))}

          {/* X-axis labels (simplified) */}
          <g>
            <text x={padding} y={height - padding + 20} textAnchor="start" fill="#888" fontSize="12">
              0
            </text>
            <text x={width - padding} y={height - padding + 20} textAnchor="end" fill="#888" fontSize="12">
              {utilizationHistory.length - 1}
            </text>
            <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="#ccc" />
             <text x={(width)/2} y={height-padding+20} textAnchor="middle" fill="#888" fontSize="12">
              Time (ticks)
            </text>
          </g>

          {/* Line graph */}
          <path d={pathData} fill="none" stroke="red" strokeWidth="2" />
        </svg>
      </Box>
    </Paper>
  );
}
