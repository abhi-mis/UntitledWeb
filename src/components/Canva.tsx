import React, { useState, useRef, useEffect } from 'react';
import { 
  Pencil, 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  Download, 
  Trash2, 
  Undo2, 
  Redo2,
  MinusCircle,
  PlusCircle,
  MousePointer,
  Pen,
  X,
  Settings,
  Grid,
  Layers,
  Paintbrush,
} from 'lucide-react';

type Tool = 'pencil' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text' | 'select';

interface DrawingAction {
  tool: Tool;
  points?: { x: number; y: number }[];
  color?: string;
  lineWidth?: number;
  text?: string;
  position?: { x: number; y: number };
}

export default function Canva() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [redoActions, setRedoActions] = useState<DrawingAction[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [text, setText] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;

    const handleResize = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempContext = tempCanvas.getContext('2d');
      if (!tempContext) return;
      tempContext.drawImage(canvas, 0, 0);

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      context.drawImage(tempCanvas, 0, 0);
      context.lineCap = 'round';
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [color, lineWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pencil' || tool === 'pen' || tool === 'eraser') {
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
      setCurrentPath([...currentPath, { x, y }]);
    } else if (tool === 'rectangle') {
      const startPoint = currentPath[0];
      redrawCanvas(actions);
      contextRef.current.beginPath();
      contextRef.current.rect(
        startPoint.x,
        startPoint.y,
        x - startPoint.x,
        y - startPoint.y
      );
      contextRef.current.stroke();
    } else if (tool === 'circle') {
      const startPoint = currentPath[0];
      const radius = Math.sqrt(
        Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2)
      );
      redrawCanvas(actions);
      contextRef.current.beginPath();
      contextRef.current.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      contextRef.current.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !contextRef.current) return;

    contextRef.current.closePath();
    setIsDrawing(false);

    if (currentPath.length > 0) {
      const newAction: DrawingAction = {
        tool,
        points: currentPath,
        color: tool === 'eraser' ? '#ffffff' : color,
        lineWidth : lineWidth,
      };
      setActions([...actions, newAction]);
      setRedoActions([]);
    }
    setCurrentPath([]);
  };

  const handleUndo = () => {
    if (actions.length === 0) return;
    const lastAction = actions[actions.length - 1];
    setRedoActions([...redoActions, lastAction]);
    setActions(actions.slice(0, -1));
    redrawCanvas(actions.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoActions.length === 0) return;
    const nextAction = redoActions[redoActions.length - 1];
    setActions([...actions, nextAction]);
    setRedoActions(redoActions.slice(0, -1));
    redrawCanvas([...actions, nextAction]);
  };

  const redrawCanvas = (actionsToRedraw: DrawingAction[]) => {
    if (!contextRef.current || !canvasRef.current) return;

    const context = contextRef.current;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (showGrid) {
      drawGrid(context, canvasRef.current.width, canvasRef.current.height);
    }

    actionsToRedraw.forEach(action => {
      if (!action.points || action.points.length === 0) return;

      context.beginPath();
      context.strokeStyle = action.color || color;
      context.lineWidth = action.lineWidth || lineWidth;
      
      context.moveTo(action.points[0].x, action.points[0].y);
      action.points.forEach(point => {
        context.lineTo(point.x, point.y);
      });
      context.stroke();
      context.closePath();
    });
  };

  const drawGrid = (context: CanvasRenderingContext2D, width: number, height: number) => {
    context.save();
    context.strokeStyle = '#ddd';
    context.lineWidth = 0.5;

    for (let x = 0; x <= width; x += 20) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    for (let y = 0; y <= height; y += 20) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    context.restore();
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setActions([]);
    setRedoActions([]);
  };

  const saveCanvas = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleTextSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && textPosition && contextRef.current) {
      contextRef.current.font = '16px sans-serif';
      contextRef.current.fillStyle = color;
      contextRef.current.fillText(text, textPosition.x, textPosition.y);
      
      setActions([...actions, {
        tool: 'text',
        text,
        position: textPosition,
        color
      }]);
      
      setText('');
      setTextPosition(null);
    }
  };

  const tools = [
    { icon: <MousePointer size={20} />, name: 'select' as Tool, label: 'Select' },
    { icon: <Pencil size={20} />, name: 'pencil' as Tool, label: 'Pencil' },
    { icon: <Pen size={20} />, name: 'pen' as Tool, label: 'Pen' },
    { icon: <Eraser size={20} />, name: 'eraser' as Tool, label: 'Eraser' },
    { icon: <Square size={20} />, name: 'rectangle' as Tool, label: 'Rectangle' },
    { icon: <Circle size={20} />, name: 'circle' as Tool, label: 'Circle' },
    { icon: <Type size={20} />, name: 'text' as Tool, label: 'Text' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
         
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {/* <Pen className="w-8 h-8 text-purple-600" /> */}
             White Board
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={actions.length === 0}
              >
                <Undo2 size={20} />
              </button>
              <button
                onClick={handleRedo}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={redoActions.length === 0}
              >
                <Redo2 size={20} />
              </button>
              <button
                onClick={clearCanvas}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={saveCanvas}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-[calc(100vh-12rem)] cursor-crosshair border-black-600"
          />
        </div>
      </div>

      {/* Tool Palette */}
      <div className="bg-white p-3 mx-auto rounded-2xl shadow-lg border border-gray-200 flex flex-row gap-3 z-10 items-center w-2/5">
  {tools.map((item) => (
    <button
      key={item.name}
      onClick={() => setTool(item.name)}
      className={`p-3 rounded-xl transition-all ${
        tool === item.name
          ? "bg-blue-100 text-blue-600"
          : "text-gray-600 hover:bg-gray-100"
      }`}
      title={item.label}
    >
      {item.icon}
    </button>
  ))}
  <div className="h-px bg-gray-200 my-2" />
  <div className="flex items-center gap-2">
    <input
      type="color"
      value={color}
      onChange={(e) => setColor(e.target.value)}
      className="w-8 h-8 p-0 border-2 border-gray-300 rounded-lg cursor-pointer"
      title="Color picker"
    />
    {/* <input
      type="range"
      value={lineWidth}
      onChange={(e) => setLineWidth(parseInt(e.target.value))}
      min="1"
      max="20"
      className="w-16"
      title="Line width" /> */}
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLineWidth(Math.max(1, lineWidth - 1))}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        title="Decrease size"
      >
        <MinusCircle size={20} />
      </button>
      <span className="text-sm font-medium text-gray-600 mx-2">{lineWidth}</span>
      <button
        onClick={() => setLineWidth(lineWidth + 1)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        title="Increase size"
      >
        <PlusCircle size={20} />
      </button>
    </div>
  </div>
</div>

      {/* Text Input */}
      {tool === 'text' && textPosition && (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleTextSubmit}
          className="fixed px-2 py-1 border border-gray-300 rounded shadow-sm"
          style={{
            left: textPosition.x + 'px',
            top: textPosition.y + 'px',
            minWidth: '100px'
          }}
          autoFocus
        />
      )}
    </div>
  );
}