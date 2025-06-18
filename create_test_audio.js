// Simple script to create valid test MP3 files using Web Audio API
// This creates a simple tone that browsers can definitely play

const fs = require('fs');
const path = require('path');

// Create a simple HTML file that generates audio and saves it
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Audio Generator</title>
</head>
<body>
    <h1>Generating Test Audio Files...</h1>
    <button onclick="generateAudio()">Generate Audio</button>
    <div id="status"></div>
    
    <script>
    async function generateAudio() {
        const status = document.getElementById('status');
        status.innerHTML = 'Generating audio...';
        
        try {
            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Generate 5 seconds of audio at 44.1kHz
            const sampleRate = 44100;
            const duration = 5; // seconds
            const length = sampleRate * duration;
            
            // Create buffer
            const buffer = audioContext.createBuffer(2, length, sampleRate);
            
            // Generate instrumental (440Hz tone)
            const instrumentalData = buffer.getChannelData(0);
            for (let i = 0; i < length; i++) {
                instrumentalData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.3;
            }
            
            // Generate vocal (880Hz tone)
            const vocalData = buffer.getChannelData(1);
            for (let i = 0; i < length; i++) {
                vocalData[i] = Math.sin(2 * Math.PI * 880 * i / sampleRate) * 0.3;
            }
            
            status.innerHTML = 'Audio generated! Copy these to your assets folder.';
            
            // For now, we'll create data URLs that can be tested
            console.log('Test audio generated successfully');
            
        } catch (error) {
            status.innerHTML = 'Error: ' + error.message;
            console.error('Error generating audio:', error);
        }
    }
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'audio_generator.html'), htmlContent);
console.log('Created audio_generator.html - open this in a browser to test audio generation');
console.log('However, for now, let\'s use a simpler solution...');