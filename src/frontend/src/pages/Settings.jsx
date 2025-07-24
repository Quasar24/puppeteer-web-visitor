import React from 'react';
import { Button, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ConfigPanel from '../components/ConfigPanel';

function Settings() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Configuration Panel */}
      <ConfigPanel />
    </Box>
  );
}

export default Settings;