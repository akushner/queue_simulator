import { Controls } from "@/components/Controls";
import { Simulation } from "@/components/Simulation";
import { Dashboard } from "@/components/Dashboard";
import { QueueMeter } from "@/components/QueueMeter"; // Import QueueMeter
import { UtilizationGraph } from "@/components/UtilizationGraph";
import { Box, Typography } from '@mui/material';

function App() {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      color: 'text.primary',
      p: 4
    }}>
      <Box sx={{ width: '100%', maxWidth: 'lg' }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          CI/CD Queue Simulator
        </Typography>
        <Dashboard />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'auto 2fr 1fr' }, gap: 4 }}>
            <QueueMeter />
            <Box sx={{ height: 600, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
              <Simulation />
            </Box>
            <Box sx={{ height: 600, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, p: 3, display: 'flex', flexDirection: 'column' }}>
              <Controls />
            </Box>
          </Box>
          <UtilizationGraph />
        </Box>
      </Box>
    </Box>
  );
}

export default App;