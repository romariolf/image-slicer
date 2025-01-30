import { useState } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ImageUpload from './components/ImageUpload'
import ImageEditor from './components/ImageEditor'
import CropIcon from '@mui/icons-material/Crop'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
    },
    text: {
      primary: '#1a1a1a',
    }
  },
})

function App() {
  const [selectedImage, setSelectedImage] = useState(null)

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          backgroundColor: 'background.default',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: 'calc(100% - 32px)',
            height: 'calc(100% - 32px)',
            maxWidth: '1200px',
            maxHeight: '900px',
            m: 2,
            borderRadius: { xs: 1, sm: 2 },
            bgcolor: 'white',
            boxShadow: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
              borderBottom: 1,
              borderColor: 'divider',
              flexShrink: 0,
              bgcolor: 'white',
            }}
          >
            <CropIcon sx={{ 
              fontSize: { xs: 24, sm: 28 },
              color: 'primary.main' 
            }} />
            <Typography 
              variant="h4" 
              component="h1"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem' },
                fontWeight: 500,
                color: 'text.primary',
              }}
            >
              Image Slicer
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: { xs: 2, sm: 3 },
            }}
          >
            {selectedImage ? (
              <ImageEditor
                image={selectedImage}
                onReset={() => setSelectedImage(null)}
              />
            ) : (
              <ImageUpload onImageSelect={setSelectedImage} />
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
