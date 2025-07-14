import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import html2canvas from 'html2canvas';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit } from '@fortawesome/free-solid-svg-icons';

const WebcamCapture = ({
  layout = '4',
  timer = 3,
  filter = 'none',
  frameColor = '#fff',
  setIsComplete,
}) => {
  const webcamRef = useRef(null);
  const layoutCount = parseInt(layout);
  const [photos, setPhotos] = useState(() => Array(layoutCount).fill(null));
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);
  const [stripColor, setStripColor] = useState('#FFF9FC');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const allFilled = photos.every(photo => photo !== null);
    setIsComplete(allFilled);
  }, [photos, setIsComplete]);

  useEffect(() => {
    setPhotos(Array(layoutCount).fill(null));
  }, [layoutCount]);

  const videoConstraints = {
    width: 600,
    height: 400,
    facingMode: 'user',
  };

  const startCapture = async () => {
    const newPhotos = [...photos];
    for (let i = 0; i < layoutCount; i++) {
      if (timer > 0) await runCountdown(timer);

      const webcam = webcamRef.current.video;
      const canvas = document.createElement('canvas');
      canvas.width = webcam.videoWidth;
      canvas.height = webcam.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
      const imageSrc = canvas.toDataURL('image/jpeg');
      newPhotos[i] = imageSrc;
      setPhotos([...newPhotos]);
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
    }
  };

  const retakePhotos = () => {
    setPhotos(Array(layoutCount).fill(null));
    setIsComplete(false);
  };

  const runCountdown = (seconds) => {
    return new Promise((resolve) => {
      let count = seconds;
      setCountdown(count);
      const interval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          setCountdown(null);
          resolve();
        }
      }, 1000);
    });
  };

  const handleDownload = () => {
    const strip = document.querySelector('.strip-preview');
    html2canvas(strip, {
        scale: 3,       // increase resolution
        useCORS: true,  // external fonts/images
    }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'photostrip.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
  };

  const handleEdit = () => {
    setShowColorPicker(!showColorPicker);
  };

  // Layout config
  const getStripDimensions = () => {
    switch (layout) {
      case '1': return { width: 400, height: 300, isLandscape: true };
      case '2':
      case '6': return { width: 300, height: 400, isLandscape: false };
      case '3':
      case '4':
      default: return { width: 150, height: 400, isLandscape: false };
    }
  };

  const { width: stripWidth, height: stripHeight, isLandscape } = getStripDimensions();
  const slotCount = parseInt(layout);
  const slotFlexDirection = layout === '6' ? 'row' : isLandscape ? 'row' : 'column';
  const isGrid = layout === '6';

  return (
    <>
      {/* Mobile Rotate Warning */}
      <div className="mobile-rotate-warning">
  
        <span className="rotate-emoji" role="img" aria-label="rotate">
            🗘 If you're using a phone/tablet, please rotate your device to landscape.</span> 
      </div>

      {/* Main Content */}
      <div className="zoom-wrapper">
        <div className="webcam-capture-row">
          {/* Camera */}
          <div className="camera-section">
            <div className="camera-frame" style={{ border: `8px solid ${frameColor}`, position: 'relative' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                style={{ filter, transform: 'scaleX(-1)' }}
              />
              {flash && <div className="flash-overlay"></div>}
              {countdown !== null && (
                <div className="countdown" style={{
                  position: 'absolute',
                  bottom: '8px',
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  color: '#FF99AF',
                  fontWeight: 'bold',
                }}>
                  ⏱︎ {countdown}
                </div>
              )}
            </div>
            {photos.every(p => p === null) ? (
              <button onClick={startCapture} className="capture-button">✧ Start Capture</button>
            ) : (
              <button onClick={retakePhotos} className="capture-button">⟳ Retake Another</button>
            )}
          </div>

          {/* Strip */}
          <div className="strip-wrapper" style={{
            position: 'relative',
            width: `${stripWidth}px`,
            height: `${stripHeight}px`,
          }}>
            <div className="strip-preview" style={{
              width: '100%',
              height: '100%',
              backgroundColor: stripColor,
              display: isGrid ? 'grid' : 'flex',
              gridTemplateColumns: isGrid ? 'repeat(2, 1fr)' : undefined,
              gridTemplateRows: isGrid ? 'repeat(3, 1fr)' : undefined,
              gap: isGrid ? '6px' : undefined,
              flexDirection: isGrid ? undefined : slotFlexDirection,
              flexWrap: isGrid ? undefined : 'nowrap',
              justifyContent: isGrid ? undefined : 'space-between',
              alignItems: isGrid ? undefined : 'flex-start',
              padding: '12px 12px 40px',
              boxSizing: 'border-box',
              position: 'relative',
            }}>
              {photos.map((photo, index) => (
                <div
                  className="strip-slot"
                  key={index}
                  style={{
                    width: '100%',
                    height: '100%',
                    marginBottom: index === layoutCount - 1 ? 0 : '6px',
                    background: '#fff',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={`Pose ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="placeholder"
                      style={{ width: '100%', height: '100%', background: '#FFC7D3' }}
                    ></div>
                  )}
                </div>
              ))}

              {/* Footer */}
              <div className="strip-footer" style={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                fontFamily: "'Jua', sans-serif",
                fontSize: '0.7rem',
                color: '#738262',
              }}>
                <p className="strip-label" style={{ marginTop: '6px' }}>captured by v ♡</p>
                <p className="strip-timestamp">{new Date().toLocaleString()}</p>
              </div>
            </div>

            {/* Actions */}
            {photos.every(photo => photo !== null) && (
              <>
                <div className="action-buttons">
                  <button className="icon-button" onClick={handleDownload} title="Download">
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                  <button className="icon-button" onClick={handleEdit} title="Edit">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </div>

                {showColorPicker && (
                  <div className="color-picker">
                    <p>🎨 Choose frame color:</p>
                    <div className="color-options">
                      {[
                        { name: 'White', code: '#FFFFFF' },
                        { name: 'Black', code: '#000000' },
                        { name: 'Pink', code: '#FF99AF' },
                        { name: 'Purple', code: '#D8BFD8' },
                        { name: 'Green', code: '#A8B897' },
                        { name: 'Blue', code: '#ADD8E6' },
                        { name: 'Yellow', code: '#FFFACD' },
                        { name: 'Red', code: '#FFC7D3' },
                      ].map(color => (
                        <button
                          key={color.name}
                          onClick={() => setStripColor(color.code)}
                          style={{
                            backgroundColor: color.code,
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            margin: '5px',
                            border: '2px solid #ccc',
                            cursor: 'pointer'
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setShowColorPicker(false)}
                      style={{
                        marginTop: '10px',
                        background: '#FF99AF',
                        color: '#fff',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Save Color
                    </button>
                  </div>
                )}
                <p className="save-message">✔ Done! You can now save your photostrip.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WebcamCapture;
