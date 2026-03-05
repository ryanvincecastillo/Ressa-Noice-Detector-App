import { useEffect, useRef } from 'react';

type NoiseCanvasProps = {
  history: number[];
  currentLevel: number;
};

const GRID_LINES = 5;

const NoiseCanvas = ({ history, currentLevel }: NoiseCanvasProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#e6edf4';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_LINES; i += 1) {
      const y = (i / GRID_LINES) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const verticalLines = 10;
    for (let i = 0; i <= verticalLines; i += 1) {
      const x = (i / verticalLines) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    if (history.length > 1) {
      ctx.beginPath();
      history.forEach((value, index) => {
        const x = (index / (history.length - 1)) * width;
        const y = height - (value / 100) * height;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#4ab3a4';
      ctx.stroke();

      const lastY = height - (currentLevel / 100) * height;
      ctx.beginPath();
      ctx.arc(width - 4, lastY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff7f50';
      ctx.fill();
    }

    ctx.fillStyle = '#5f6f7d';
    ctx.font = '12px "Trebuchet MS", sans-serif';
    ctx.fillText('15s history', 12, 20);
    ctx.fillText('Now', width - 38, 20);
  }, [history, currentLevel]);

  return <canvas className="noise-canvas" ref={canvasRef} aria-label="Live noise chart" />;
};

export default NoiseCanvas;
