import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Clear,
  GetApp,
  FilterList,
  MoreVert
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

function LogViewer() {
  const { state, api } = useApp();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const listRef = useRef(null);
  const shouldAutoScroll = useRef(true);

  const filteredLogs = state.logs.filter(log => {
    const matchesFilter = filter === 'all' || log.type === filter;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (shouldAutoScroll.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [state.logs]);

  // Detect if user has scrolled up
  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      shouldAutoScroll.current = scrollTop + clientHeight >= scrollHeight - 10;
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleClearLogs = async () => {
    try {
      await api.clearLogs();
      setSnackbar({ open: true, message: 'Logs cleared successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
    setAnchorEl(null);
  };

  const handleExportLogs = async (format) => {
    try {
      await api.exportLogs(format);
      setSnackbar({ open: true, message: `Logs exported as ${format.toUpperCase()}`, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
    setAnchorEl(null);
  };

  const logCounts = {
    all: state.logs.length,
    info: state.logs.filter(log => log.type === 'info').length,
    success: state.logs.filter(log => log.type === 'success').length,
    error: state.logs.filter(log => log.type === 'error').length,
    warning: state.logs.filter(log => log.type === 'warning').length
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              📝 Live Logs
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={`${filteredLogs.length} logs`} 
                size="small" 
                color="primary" 
              />
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                size="small"
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={filter}
                  label="Filter by Type"
                  onChange={(e) => setFilter(e.target.value)}
                  startAdornment={<FilterList sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">All ({logCounts.all})</MenuItem>
                  <MenuItem value="info">Info ({logCounts.info})</MenuItem>
                  <MenuItem value="success">Success ({logCounts.success})</MenuItem>
                  <MenuItem value="error">Error ({logCounts.error})</MenuItem>
                  <MenuItem value="warning">Warning ({logCounts.warning})</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClearLogs}
                size="small"
              >
                Clear All Logs
              </Button>
            </Grid>
          </Grid>

          {/* Logs List */}
          <Box
            ref={listRef}
            onScroll={handleScroll}
            sx={{
              height: 400,
              overflow: 'auto',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: 'grey.50'
            }}
          >
            {filteredLogs.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                {state.logs.length === 0 ? 'No logs yet. Start automation to see logs.' : 'No logs match the current filter.'}
              </Box>
            ) : (
              <List dense>
                {filteredLogs.map((log, index) => (
                  <ListItem key={`${log.timestamp}-${index}`} divider>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ 
                          fontSize: '1.2em',
                          lineHeight: 1,
                          mt: 0.5
                        }}
                      >
                        {getLogIcon(log.type)}
                      </Typography>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip
                            label={log.type}
                            size="small"
                            color={getLogColor(log.type)}
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(log.timestamp)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {log.message}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {filteredLogs.length > 0 && (
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Showing {filteredLogs.length} of {state.logs.length} logs
                {!shouldAutoScroll.current && ' • Auto-scroll disabled (scroll to bottom to re-enable)'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExportLogs('json')}>
          <GetApp sx={{ mr: 1 }} />
          Export as JSON
        </MenuItem>
        <MenuItem onClick={() => handleExportLogs('txt')}>
          <GetApp sx={{ mr: 1 }} />
          Export as TXT
        </MenuItem>
        <MenuItem onClick={handleClearLogs}>
          <Clear sx={{ mr: 1 }} />
          Clear All Logs
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default LogViewer;