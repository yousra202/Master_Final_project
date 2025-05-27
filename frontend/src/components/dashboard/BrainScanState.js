
import React from 'react';
import { Box, Card, CardContent, Typography, Divider } from '@mui/material';
import { PieChart } from 'react-minimal-pie-chart';

const BrainScanStats = ({ scans }) => {
  if (!scans || scans.length === 0) {
    return null;
  }
  
  // Count tumor vs. no tumor scans
  const tumorCount = scans.filter(scan => !scan.result.includes('No')).length;
  const noTumorCount = scans.length - tumorCount;
  
  // Calculate average confidence
  const avgConfidence = scans.reduce((sum, scan) => sum + scan.confidence, 0) / scans.length;
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Statistiques des analyses IRM cérébrales
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '40%' }}>
            <PieChart
              data={[
                { title: 'Tumeur détectée', value: tumorCount, color: '#f44336' },
                { title: 'Aucune tumeur', value: noTumorCount, color: '#4caf50' },
              ]}
              lineWidth={20}
              paddingAngle={2}
              rounded
              label={({ dataEntry }) => dataEntry.value}
              labelStyle={{ fontSize: '5px', fill: '#fff' }}
              labelPosition={70}
            />
          </Box>
          
          <Box sx={{ width: '60%', pl: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Total des analyses:</strong> {scans.length}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Tumeurs détectées:</strong> {tumorCount}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Analyses normales:</strong> {noTumorCount}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Confiance moyenne:</strong> {avgConfidence.toFixed(2)}%
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Dernière analyse:</strong> {scans[0].formatted_date}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BrainScanStats;


