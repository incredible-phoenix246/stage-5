// popup.js

document.addEventListener('DOMContentLoaded', function () {
  const startRecordingBtn = document.querySelector('.recording-btn');
  const videoElement = document.createElement('video');
  let mediaRecorder;
  let isRecording = false;

  startRecordingBtn.addEventListener('click', toggleRecording);

  async function toggleRecording() {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

        videoElement.srcObject = stream;
        videoElement.play();

        // Create a MediaRecorder to record the screen
        mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);

          // Send a message to the background script to open the recording in a new tab
          chrome.runtime.sendMessage({ action: 'openRecording', url });

          isRecording = false;
          startRecordingBtn.textContent = 'Start Recording';
        };

        mediaRecorder.start();
        isRecording = true;
        startRecordingBtn.textContent = 'Stop Recording';
      } catch (error) {
        console.error('Error starting screen recording:', error);
      }
    } else {
      mediaRecorder.stop();
    }
  }
});

