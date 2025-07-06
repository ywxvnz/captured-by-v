import React, { useState } from 'react';
import './App.css';
import WebcamCapture from './components/WebcamCapture';

function App() {
  const [timer, setTimer] = useState(3);        // default to 3 sec
  const [layout, setLayout] = useState('4');    // default layout is 4
  const [isComplete, setIsComplete] = useState(false);

  return (
    <div className="App">
      <h1 style={{ fontFamily: "'Jua', sans-serif" }}>captured by v ♡</h1>

      {/* Timer Selection */}
      <div className="control-bar">
        <div className="timer-selector">
          <label htmlFor="timer">⏱ Timer:</label>
          <select
            id="timer"
            value={timer}
            onChange={(e) => setTimer(Number(e.target.value))}
          >
            <option value={1}>1 sec</option>
            <option value={3}>3 sec</option>
            <option value={5}>5 sec</option>
          </select>
        </div>

        <div className="layout-selector">
          <label htmlFor="layout">⠿ Layout:</label>
          <select
            id="layout"
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="6">6</option>
          </select>
        </div>
      </div>

      {/* Webcam Component */}
      <WebcamCapture
        layout={layout}
        timer={timer}
        filter="none"
        frameColor="#fff"
        setIsComplete={setIsComplete}
      />
    </div>
  );
}

export default App;
