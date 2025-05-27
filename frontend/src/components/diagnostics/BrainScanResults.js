import React from 'react';
import axios from 'axios';

import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import { Warning, CheckCircle } from '@mui/icons-material';

const BrainScanResults = ({ scans }) => {
  if (!scans || scans.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Aucune analyse d'IRM cérébrale disponible
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Résultats d'analyses IRM cérébrales
      </Typography>
      <Grid container spacing={3}>
        {scans.map((scan) => (
          <Grid item xs={12} md={6} key={scan.id}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardMedia
                component="img"
                height="200"
                image={scan.image_url}
                alt="IRM cérébrale"
                sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Analyse du {scan.formatted_date}
                  </Typography>
                  <Chip
                    icon={scan.result.includes('No') ? <CheckCircle /> : <Warning />}
                    label={scan.result.includes('No') ? 'Aucune tumeur détectée' : 'Tumeur détectée'}
                    color={scan.result.includes('No') ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Confiance:</strong> {scan.confidence.toFixed(2)}%
                </Typography>
                {scan.notes && (
                  <Paper variant="outlined" sx={{ p: 1, mt: 1, bgcolor: '#f8f9fa' }}>
                    <Typography variant="body2">
                      <strong>Notes:</strong> {scan.notes}
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BrainScanResults;
