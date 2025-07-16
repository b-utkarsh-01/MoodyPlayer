import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function FacialExpression() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [expression, setExpression] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestedSongs, setSuggestedSongs] = useState([]);

  const expressionEmojis = {
    neutral: '😐',
    happy: '😄',
    sad: '😢',
    angry: '😠',
    fearful: '😨',
    disgusted: '🤢',
    surprised: '😮',
  };

  const moodToSongs = {
    happy: [
      { title: 'Happy – Pharrell Williams', url: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs' },
      { title: 'Can’t Stop The Feeling – Justin Timberlake', url: 'https://www.youtube.com/watch?v=ru0K8uYEZWw' },
    ],
    sad: [
      { title: 'Someone Like You – Adele', url: 'https://www.youtube.com/watch?v=hLQl3WQQoQ0' },
      { title: 'Let Her Go – Passenger', url: 'https://www.youtube.com/watch?v=RBumgq5yVrA' },
    ],
    angry: [
      { title: 'Numb – Linkin Park', url: 'https://www.youtube.com/watch?v=kXYiU_JCYtU' },
      { title: 'Break Stuff – Limp Bizkit', url: 'https://www.youtube.com/watch?v=ZpUYjpKg9KY' },
    ],
    fearful: [
      { title: 'Creep – Radiohead', url: 'https://www.youtube.com/watch?v=XFkzRNyygfk' },
      { title: 'Everybody Hurts – R.E.M.', url: 'https://www.youtube.com/watch?v=ijZRCIrTgQc' },
    ],
    disgusted: [
      { title: 'Toxic – Britney Spears', url: 'https://www.youtube.com/watch?v=LOZuxwVk7TU' },
    ],
    surprised: [
      { title: 'A Sky Full of Stars – Coldplay', url: 'https://www.youtube.com/watch?v=VPRjCeoBqrI' },
    ],
    neutral: [
      { title: 'Weightless – Marconi Union', url: 'https://www.youtube.com/watch?v=UfcAVejslrU' },
    ],
  };

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    loadModels().then(startVideo);

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const detectMood = async () => {
    setLoading(true);
    setExpression(null);
    setSuggestedSongs([]);

    if (!videoRef.current || !canvasRef.current) return;

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    const canvas = canvasRef.current;
    const displaySize = {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight,
    };

    faceapi.matchDimensions(canvas, displaySize);
    const resized = faceapi.resizeResults(detections, displaySize);


    if (resized.length > 0) {
      const sorted = Object.entries(resized[0].expressions).sort((a, b) => b[1] - a[1]);
      const topExpression = sorted[0][0];
      setExpression(topExpression);
      setSuggestedSongs(moodToSongs[topExpression] || []);
    } else {
      setExpression('No face detected');
    }

    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', maxWidth: '800px', margin: 'auto' }}>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', width: '280px', height: '210px', borderRadius: '8px', overflow: 'hidden' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <canvas
            ref={canvasRef}
            width="280"
            height="210"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>

        <div>
          <button
            onClick={detectMood}
            style={{
              backgroundColor: '#7B2FF7',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Detecting...' : 'Detect Mood'}
          </button>

          {expression && (
            <div style={{ marginTop: '16px', fontSize: '20px' }}>
              Mood: {expressionEmojis[expression] || ''} <strong>{expression}</strong>
            </div>
          )}
        </div>
      </div>

      {suggestedSongs.length > 0 && (
        <div
        style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <h3 style={{ marginBottom: '10px' }}>🎵 Suggested Songs:</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {suggestedSongs.map((song, index) => (
              <li key={index} style={{  }}>
                <a
                  href={song.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'none',
                    color: 'white',
                    fontSize: '16px',
                  }}
                >
                  {song.title}⏯️
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
