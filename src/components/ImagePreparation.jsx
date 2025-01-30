import { useState, useEffect, useRef } from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

const aspectRatios = {
  '1:1': 1,
  '4:3': 4/3,
  '16:9': 16/9,
  '2:3': 2/3,
  '3:2': 3/2,
};

function ImagePreparation({ image, aspectRatios, selectedRatio, onRatioChange, onComplete }) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageInfo, setImageInfo] = useState(null);
  
  // Ajustando dimensões máximas para evitar overflow
  const PREVIEW_WIDTH = {
    xs: 280,  // Reduzido para telas muito pequenas
    sm: 500,
    md: 700,
    lg: 900
  };

  const PREVIEW_HEIGHT = {
    xs: 210,
    sm: 375,
    md: 525,
    lg: 675
  };

  const drawImage = (pos = position) => {
    if (!imageInfo || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { img, drawWidth, drawHeight, canvasWidth, canvasHeight, scale } = imageInfo;

    // Limpa o canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calcula os limites de movimentação
    const maxX = Math.max(0, (drawWidth - canvas.width) / 2);
    const maxY = Math.max(0, (drawHeight - canvas.height) / 2);

    // Limita a posição dentro dos limites
    const constrainedX = Math.min(Math.max(pos.x, -maxX), maxX);
    const constrainedY = Math.min(Math.max(pos.y, -maxY), maxY);

    // Atualiza a posição se necessário
    if (pos.x !== constrainedX || pos.y !== constrainedY) {
      setPosition({ x: constrainedX, y: constrainedY });
    }

    // Desenha a imagem
    const drawX = (canvas.width - drawWidth) / 2 + constrainedX;
    const drawY = (canvas.height - drawHeight) / 2 + constrainedY;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // Desenha a borda
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Desenha linhas de grade
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    // Linhas verticais
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(canvas.width * (i/3), 0);
      ctx.lineTo(canvas.width * (i/3), canvas.height);
      ctx.stroke();
    }

    // Linhas horizontais
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * (i/3));
      ctx.lineTo(canvas.width, canvas.height * (i/3));
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const targetRatio = aspectRatios[selectedRatio];
      
      // Calcular dimensões reais do recorte
      let realWidth = img.width;
      let realHeight = img.height;
      
      if (img.width / img.height > targetRatio) {
        realWidth = Math.round(realHeight * targetRatio);
      } else {
        realHeight = Math.round(realWidth / targetRatio);
      }

      // Calcular dimensões de preview mantendo proporção
      let previewWidth, previewHeight;
      if (targetRatio > PREVIEW_WIDTH.md / PREVIEW_HEIGHT.md) {
        previewWidth = PREVIEW_WIDTH.md;
        previewHeight = PREVIEW_WIDTH.md / targetRatio;
      } else {
        previewHeight = PREVIEW_HEIGHT.md;
        previewWidth = PREVIEW_HEIGHT.md * targetRatio;
      }

      // Configurar canvas para dimensões de preview
      canvas.width = previewWidth;
      canvas.height = previewHeight;

      // Calcular escala de preview
      const scale = previewWidth / realWidth;

      // Calcular dimensões de desenho para preview
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;

      const newImageInfo = {
        img,
        drawWidth,
        drawHeight,
        canvasWidth: previewWidth,
        canvasHeight: previewHeight,
        scale,
        realWidth,
        realHeight
      };

      setImageInfo(newImageInfo);
      setPosition({ x: 0, y: 0 });

      setTimeout(() => {
        drawImage({ x: 0, y: 0 });
      }, 0);
    };

    img.onerror = (error) => {
      console.error('Erro ao carregar imagem:', error);
    };

    img.src = image;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [image, selectedRatio, aspectRatios]);

  // Atualiza o desenho quando imageInfo muda
  useEffect(() => {
    if (imageInfo) {
      drawImage(position);
    }
  }, [imageInfo]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    const newPosition = {
      x: position.x + deltaX,
      y: position.y + deltaY
    };

    setPosition(newPosition);
    setDragStart({ x, y });
    drawImage(newPosition);
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Touch events
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDragging) return;

    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    const newPosition = {
      x: position.x + deltaX,
      y: position.y + deltaY
    };

    setPosition(newPosition);
    setDragStart({ x, y });
    drawImage(newPosition);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleComplete = () => {
    if (!imageInfo) return;
    
    // Criar canvas temporário com dimensões reais para o processamento
    const tempCanvas = document.createElement('canvas');
    const { realWidth, realHeight, img } = imageInfo;
    const targetRatio = aspectRatios[selectedRatio];
    
    tempCanvas.width = realWidth;
    tempCanvas.height = realHeight;
    
    const ctx = tempCanvas.getContext('2d');
    
    // Calcular posição proporcional real
    const scaleBack = realWidth / imageInfo.canvasWidth;
    const realX = position.x * scaleBack;
    const realY = position.y * scaleBack;
    
    // Desenhar imagem com dimensões reais
    ctx.drawImage(
      img,
      (tempCanvas.width - img.width) / 2 + realX,
      (tempCanvas.height - img.height) / 2 + realY,
      img.width,
      img.height
    );

    onComplete({
      dataUrl: tempCanvas.toDataURL(),
      dimensions: {
        width: realWidth,
        height: realHeight
      }
    });
  };

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
      >
        Preparar Imagem
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, sm: 3 },
          alignItems: { xs: 'stretch', md: 'flex-start' },
          maxWidth: '100%',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxWidth: '100%',
          }}
        >
          <FormControl size="small">
            <InputLabel 
              id="ratio-select-label" 
              sx={{ 
                backgroundColor: 'white', 
                px: 1 
              }}
            >
              Proporção
            </InputLabel>
            <Select
              labelId="ratio-select-label"
              value={selectedRatio}
              onChange={(e) => onRatioChange(e.target.value)}
              sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                maxWidth: '100%'
              }}
            >
              {Object.keys(aspectRatios).map(ratio => (
                <MenuItem key={ratio} value={ratio}>{ratio}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            sx={{
              width: '100%',
              mt: 2,
              aspectRatio: selectedRatio,
              border: '1px solid #ccc',
              borderRadius: 1,
              overflow: 'hidden',
              cursor: isDragging ? 'grabbing' : 'grab',
              backgroundColor: '#f5f5f5',
              touchAction: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '100%',
              maxHeight: {
                xs: PREVIEW_HEIGHT.xs,
                sm: PREVIEW_HEIGHT.sm,
                md: PREVIEW_HEIGHT.md,
                lg: PREVIEW_HEIGHT.lg
              }
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'block',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            />
          </Box>

          {imageInfo && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Resolução final: {imageInfo.realWidth}x{imageInfo.realHeight} pixels
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            width: { xs: '100%', md: '200px' },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Arraste a imagem para ajustar a área de recorte
          </Typography>

          <Button
            variant="contained"
            onClick={handleComplete}
            fullWidth
            size={window.innerWidth < 600 ? "medium" : "large"}
          >
            Continuar para Divisão
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ImagePreparation; 