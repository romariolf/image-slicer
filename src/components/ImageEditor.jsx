import { useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel } from '@mui/material';
import ImagePreparation from './ImagePreparation';
import ImageSlicer from './ImageSlicer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const aspectRatios = {
  '1:1': 1,
  '4:3': 4/3,
  '16:9': 16/9,
  '2:3': 2/3,  // Nova proporção
  '3:2': 3/2,
};

function ImageEditor({ image, onReset }) {
  const [step, setStep] = useState('prepare');
  const [preparedImage, setPreparedImage] = useState(null);
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  
  const handlePrepareComplete = (processedImage) => {
    setPreparedImage(processedImage);
    setStep('slice');
  };

  return (
    <Box>
      <Stepper 
        activeStep={step === 'prepare' ? 0 : 1} 
        sx={{ mb: 4 }}
        alternativeLabel
      >
        <Step>
          <StepLabel>Preparar Imagem</StepLabel>
        </Step>
        <Step>
          <StepLabel>Dividir Imagem</StepLabel>
        </Step>
      </Stepper>

      {step === 'prepare' ? (
        <ImagePreparation 
          image={image}
          aspectRatios={aspectRatios}
          selectedRatio={selectedRatio}
          onRatioChange={setSelectedRatio}
          onComplete={handlePrepareComplete}
        />
      ) : (
        <ImageSlicer 
          image={preparedImage}
          dimensions={preparedImage.dimensions}
          onBack={() => setStep('prepare')}
        />
      )}
      
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onReset}
        sx={{ mt: 4 }}
      >
        Escolher outra imagem
      </Button>
    </Box>
  );
}

export default ImageEditor; 