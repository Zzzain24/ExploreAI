"use client";
import { useState, useEffect, useMemo } from 'react';
import { Box, IconButton, Stack, TextField, createTheme, ThemeProvider, Typography } from '@mui/material';
import Brightness2Icon from '@mui/icons-material/Brightness2'; 
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([{ role: 'user', prompt: message }]),
});

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('light');

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm the ExploreAI assistant ✈️ How can I help you today?",
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (message.trim() === '') return;

    const userMessage = { role: 'user', content: message };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ role: 'user', prompt: message }]),
    });

    const data = await response.json();
    const fullText = data.results[0].text;
    const assistantMessage = { role: 'assistant', content: '' };

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        assistantMessage.content += fullText[currentIndex];
        setMessages((prevMessages) => [...prevMessages.slice(0, -1), { ...assistantMessage }]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    setMessage('');
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
          primary: { main: mode === 'light' ? '#007bff' : '#0056b3' },
          background: { default: mode === 'light' ? '#F0FFFF' : '#303030' },
          text: { primary: mode === 'light' ? '#000000' : '#ffffff' },
        },
      }),
    [mode]
  );  

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor={theme.palette.background.default}
        color={theme.palette.text.primary}
        position="relative"
        p={2}
      >
        <Stack
          direction={{ xs: 'column', md: 'column' }} // Stack vertically on xs screens, horizontally on md+
          spacing={2}
          marginTop={5}
          alignItems="center"
        >
          <Box
            p={2}
            maxWidth={{ xs: '90%', sm: '80%', md: '70%' }} // Restrict width
            textAlign="center" // Center text for better appearance
          >
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
              }}
            >
              ExploreAI
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'normal',
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
              }}
            >
              Your personal assistant for travel recommendations and more
            </Typography>
          </Box>

          <IconButton onClick={toggleMode}>
            {mode === 'light' ? <Brightness2Icon /> : <WbSunnyIcon />}
          </IconButton>
        </Stack>

        <Stack
          direction="column"
          width="500px"
          height="600px"
          border="1px solid"
          borderColor={theme.palette.divider}
          marginBottom={1}
          p={2}
          spacing={3}
          mt={2}
          sx={{
            bgcolor: mode === 'light' ? '#ffffff' : '#404040', // White in light mode, darker grey in dark mode
            color: mode === 'light' ? '#000000' : '#ffffff',
          }}
        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
              >
                <Box
                  sx={{
                    bgcolor: msg.role === 'assistant'
                      ? (mode === 'light' ? '#838383' : '#505050') // Lighter grey in dark mode
                      : (mode === 'light' ? '#0096FF' : '#007ACC'), // Slightly lighter blue in dark mode
                    color: '#ffffff',
                    borderRadius: 16,
                    p: 3,
                    maxWidth: '70%',
                  }}
                >
                  {msg.content}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{
                backgroundColor: mode === 'light' ? '#ffffff' : '#505050',
                color: mode === 'light' ? '#000000' : '#ffffff',
              }}
            />
            <IconButton 
              variant="contained" 
              onClick={sendMessage} 
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                padding: '10px',
                borderRadius: '8px'
              }}
            >
              Send
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
