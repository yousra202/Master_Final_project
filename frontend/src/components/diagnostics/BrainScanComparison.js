
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { CompareArrows } from '@mui/icons-material';

const BrainScanComparison = ({ scans }) => {
  const [scan1Id, setScan1Id] = useState('');
  const [scan2Id, setScan2Id] = useState('');
  
  if (!scans || scans.length < 2) {
    return (
      <Typography variant="body2" color="text.secondary">
        Au moins deux analyses sont nécessaires pour effectuer une comparaison.
      </Typography>
    );
  }
  
  const scan1 = scans.find(s => s.id === scan1Id);
  const scan2 = scans.find(s => s.id === scan2Id);
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Comparer les analyses IRM
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <FormControl fullWidth>
            <InputLabel>Première analyse</InputLabel>
            <Select
              value={scan1Id}
              onChange={(e) => setScan1Id(e.target.value)}
              label="Première analyse"
            >
              {scans.map(scan => (
                <MenuItem key={`scan1-${scan.id}`} value={scan.id}>
                  {scan.formatted_date} - {scan.result.includes('No') ? 'Normal' : 'Tumeur'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CompareArrows sx={{ fontSize: 40, color: 'text.secondary' }} />
        </Grid>
        
        <Grid item xs={12} md={5}>
          <FormControl fullWidth>
            <InputLabel>Seconde analyse</InputLabel>
            <Select
              value={scan2Id}
              onChange={(e) => setScan2Id(e.target.value)}
              label="Seconde analyse"
            >
              {scans.map(scan => (
                <MenuItem key={`scan2-${scan.id}`} value={scan.id}>
                  {scan.formatted_date} - {scan.result.includes('No') ? 'Normal' : 'Tumeur'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {scan1 && scan2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <Box sx={{ position: 'relative' }}>
                <img 
                  src={scan1.image_url} 
                  alt="IRM 1" 
                  style={{ width: '100%', height: 300, objectFit: 'contain' }} 
                />
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  bgcolor: 'rgba(0,0,0,0.6)', 
                  color: 'white',
                  p: 1
                }}>
                  <Typography variant="subtitle2">
                    {scan1.formatted_date}
                  </Typography>
                </Box>
              </Box>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="medium">
                  Résultat: {scan1.result.includes('No') ? 'Aucune tumeur détectée' : 'Tumeur détectée'}
                </Typography>
                <Typography variant="body2">
                  Confiance: {scan1.confidence.toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <Box sx={{ position: 'relative' }}>
                <img 
                  src={scan2.image_url} 
                  alt="IRM 2" 
                  style={{ width: '100%', height: 300, objectFit: 'contain' }} 
                />
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  bgcolor: 'rgba(0,0,0,0.6)', 
                  color: 'white',
                  p: 1
                }}>
                  <Typography variant="subtitle2">
                    {scan2.formatted_date}
                  </Typography>
                </Box>
              </Box>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="medium">
                  Résultat: {scan2.result.includes('No') ? 'Aucune tumeur détectée' : 'Tumeur détectée'}
                </Typography>
                <Typography variant="body2">
                  Confiance: {scan2.confidence.toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analyse comparative
                </Typography>
                <Typography variant="body1">
                  {scan1.result === scan2.result ? (
                    `Les deux analyses montrent des résultats similaires: ${scan1.result.includes('No') ? 'aucune tumeur détectée' : 'tumeur détectée'}.`
                  ) : (
                    `Les résultats des analyses diffèrent. L'analyse du ${scan1.formatted_date} indique ${scan1.result.includes('No') ? 'aucune tumeur' : 'une tumeur'}, tandis que l'analyse du ${scan2.formatted_date} indique ${scan2.result.includes('No') ? 'aucune tumeur' : 'une tumeur'}.`
                  )}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {Math.abs(scan1.confidence - scan2.confidence) > 10 ? (
                    `Il y a une différence significative dans le niveau de confiance entre les deux analyses (${Math.abs(scan1.confidence - scan2.confidence).toFixed(2)}%).`
                  ) : (
                    `Les niveaux de confiance des deux analyses sont relativement proches (différence de ${Math.abs(scan1.confidence - scan2.confidence).toFixed(2)}%).`
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default BrainScanComparison;