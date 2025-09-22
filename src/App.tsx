import { Controls } from "@/components/Controls";
import { Simulation } from "@/components/Simulation";
import { Dashboard } from "@/components/Dashboard"; // Import Dashboard
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
            <Box sx={{ height: 600, bgcolor: 'grey.900', borderRadius: 2, boxShadow: 3 }}>
              <Simulation />
            </Box>
            <Box sx={{ height: 600, bgcolor: 'grey.900', borderRadius: 2, boxShadow: 3, p: 3, display: 'flex', flexDirection: 'column' }}>
              <Controls />
              <Dashboard /> {/* Add Dashboard here */}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;