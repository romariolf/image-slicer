import { useState, useEffect, useRef } from 'react';
import { Box, Button, Grid, Slider, Typography } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../config';

function ImageSlicer({ image, dimensions, onBack }) {
  const [slices, setSlices] = useState({ horizontal: 2, vertical: 2 });
  const canvasRef = useRef(null);

  useEffect(() => {
    updatePreview();
  }, [image, slices]);

  const updatePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Use as dimensões passadas
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Limpa o canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenha a imagem
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Desenha a grade de divisão
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;

      // Linhas verticais
      const cellWidth = canvas.width / slices.vertical;
      for (let i = 1; i < slices.vertical; i++) {
        ctx.beginPath();
        ctx.moveTo(cellWidth * i, 0);
        ctx.lineTo(cellWidth * i, canvas.height);
        ctx.stroke();
      }

      // Linhas horizontais
      const cellHeight = canvas.height / slices.horizontal;
      for (let i = 1; i < slices.horizontal; i++) {
        ctx.beginPath();
        ctx.moveTo(0, cellHeight * i);
        ctx.lineTo(canvas.width, cellHeight * i);
        ctx.stroke();
      }
    };

    img.src = image.dataUrl;
  };

  const handleProcess = async () => {
    try {
      const formData = new FormData();
      
      // Converter base64 para blob
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      formData.append('image', blob);
      
      formData.append('slices_h', slices.horizontal);
      formData.append('slices_v', slices.vertical);
      formData.append('width', dimensions.width);
      formData.append('height', dimensions.height);

      const result = await axios.post(`${API_URL}/api/process-image`, formData, {
        responseType: 'blob'
      });

      // Download do arquivo ZIP
      const url = window.URL.createObjectURL(new Blob([result.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'image-slices.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao processar imagem. Tente novamente.');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
        Dividir Imagem
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Resolução atual: {dimensions.width}x{dimensions.height} pixels
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              width: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color="text.primary" fontWeight={500}>
                Divisões Horizontais
              </Typography>
              <Typography variant="body2" color="primary.main" fontWeight={500}>
                {slices.horizontal}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Altura de cada fatia: {Math.round(dimensions.height / slices.horizontal)} pixels
            </Typography>
            <Slider
              value={slices.horizontal}
              onChange={(e, value) => setSlices(prev => ({ ...prev, horizontal: value }))}
              min={1}
              max={10}
              marks
              valueLabelDisplay="auto"
              sx={{ color: 'primary.main' }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color="text.primary" fontWeight={500}>
                Divisões Verticais
              </Typography>
              <Typography variant="body2" color="primary.main" fontWeight={500}>
                {slices.vertical}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Largura de cada fatia: {Math.round(dimensions.width / slices.vertical)} pixels
            </Typography>
            <Slider
              value={slices.vertical}
              onChange={(e, value) => setSlices(prev => ({ ...prev, vertical: value }))}
              min={1}
              max={10}
              marks
              valueLabelDisplay="auto"
              sx={{ color: 'primary.main' }}
            />
          </Box>

          <Button
            variant="contained"
            onClick={handleProcess}
            fullWidth
            sx={{ mb: 2 }}
          >
            Processar e Baixar
          </Button>

          <Button
            variant="outlined"
            onClick={onBack}
            fullWidth
          >
            Voltar para Preparação
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ImageSlicer; 