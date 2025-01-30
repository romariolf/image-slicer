import { useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel } from '@mui/material';
import ImagePreparation from './ImagePreparation';
import ImageSlicer from './ImageSlicer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ASPECT_RATIOS = {
  '16:9': 16/9,
  '4:3': 4/3,
  '3:2': 3/2,
  '1:1': 1
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
          aspectRatios={ASPECT_RATIOS}
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