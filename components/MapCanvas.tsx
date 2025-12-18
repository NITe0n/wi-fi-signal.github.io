import React, { useRef, useState, useEffect } from 'react';
import { WifiPoint, ImageState } from '../types.ts';
import { Image as ImageIcon, Plus, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface MapCanvasProps {
  imageState: ImageState;
  points: WifiPoint[];
  onAddPoint: (x: number, y: number) => void;
  onSelectPoint: (id: number) => void;
  selectedPointId: number | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  imageState,
  points,
  onAddPoint,
  onSelectPoint,
  selectedPointId,
  onUpload
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Transform State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // Reset view when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageState.src]);

  // Zoom Handler (Wheel)
  const handleWheel = (e: React.WheelEvent) => {
    if (!imageState.src) return;
    e.stopPropagation(); // Stop scrolling the page

    const zoomIntensity = 0.001;
    const delta = -e.deltaY * zoomIntensity;
    const newScale = Math.min(Math.max(0.5, scale + delta * scale), 5); // Limit zoom 0.5x to 5x

    if (!containerRef.current) return;

    // Calculate mouse position relative to container
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom towards mouse pointer
    // Formula: newPos = mouse - (mouse - oldPos) * (newScale / oldScale)
    const scaleRatio = newScale / scale;
    const newX = mouseX - (mouseX - position.x) * scaleRatio;
    const newY = mouseY - (mouseY - position.y) * scaleRatio;

    setScale(newScale);
    setPosition({ x: newX, y: newY });
  };

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageState.src) return;
    // Only drag with left click (button 0)
    if (e.button !== 0) return;

    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Check if actually moved significantly to distinguish click from drag
    if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
      setHasMoved(true);
    }
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add Point Handler (Click)
  const handleContainerClick = (e: React.MouseEvent) => {
    // If we dragged the map, don't add a point
    if (hasMoved || !imageState.src || !imgRef.current) return;
    
    // Don't add point if clicking on UI controls
    if ((e.target as HTMLElement).closest('.controls')) return;
    
    // Don't add point if clicking on an existing pin
    if ((e.target as HTMLElement).closest('.map-pin')) return;

    // Calculate click position relative to the IMAGE, not the container
    const imgRect = imgRef.current.getBoundingClientRect();
    
    // Check if click is inside the image bounds
    if (
      e.clientX < imgRect.left || 
      e.clientX > imgRect.right || 
      e.clientY < imgRect.top || 
      e.clientY > imgRect.bottom
    ) {
      return;
    }

    const x = ((e.clientX - imgRect.left) / imgRect.width) * 100;
    const y = ((e.clientY - imgRect.top) / imgRect.height) * 100;

    onAddPoint(x, y);
  };

  // Zoom Buttons
  const zoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };
  
  const zoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (!imageState.src) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl m-4 relative overflow-hidden group">
        <div className="text-center p-6 transition-transform duration-300 group-hover:scale-105">
          <div className="bg-white p-4 rounded-full shadow-lg w-20 h-20 mx-auto flex items-center justify-center mb-4 text-blue-500">
            <ImageIcon size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Upload Floor Plan</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Upload an image of your office or home to start mapping signal strength.
          </p>
          
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors shadow-lg shadow-blue-600/20">
            <Plus size={20} />
            <span>Select Image</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={onUpload}
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-200 overflow-hidden select-none">
      {/* Viewport */}
      <div 
        ref={containerRef}
        className={`w-full h-full relative overflow-hidden flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleContainerClick}
        style={{ touchAction: 'none' }} // Prevent browser gestures
      >
        {/* Transform Layer */}
        <div 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="relative inline-block"
        >
          {/* Base Image */}
          <img 
            ref={imgRef}
            src={imageState.src} 
            alt="Floor Plan" 
            className="block max-w-none shadow-xl"
            style={{ 
              height: 'auto',
              // Initially limit size so it fits, but allow scaling
              maxHeight: scale === 1 && position.x === 0 && position.y === 0 ? '85vh' : 'none',
              maxWidth: scale === 1 && position.x === 0 && position.y === 0 ? '85vw' : 'none',
            }}
            draggable={false}
          />

          {/* Overlay Points */}
          {points.map((point) => (
            <div
              key={point.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPoint(point.id);
              }}
              className={`map-pin absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border-2 shadow-sm transition-transform hover:scale-110 cursor-pointer ${
                selectedPointId === point.id 
                  ? 'w-8 h-8 bg-blue-600 border-white text-white z-20 scale-110 ring-2 ring-blue-300' 
                  : 'w-6 h-6 bg-red-500 border-white text-white z-10 opacity-90 hover:opacity-100'
              }`}
              style={{ 
                left: `${point.x}%`, 
                top: `${point.y}%`,
              }}
            >
              <span className={`font-bold leading-none ${selectedPointId === point.id ? 'text-xs' : 'text-[10px]'}`}>
                {point.id}
              </span>
              
              {/* Tooltip for dBm if entered */}
              {point.dbm && (
                <div 
                  className="absolute top-full mt-1 px-1.5 py-0.5 bg-black/75 text-white text-[10px] rounded whitespace-nowrap pointer-events-none z-30"
                  style={{ transform: `scale(${1/scale})`, transformOrigin: 'top center' }} // Counter-scale tooltip
                >
                  {point.dbm} dBm
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Controls */}
      <div className="controls absolute bottom-6 right-6 flex flex-col gap-2 z-50">
        <button onClick={zoomIn} className="p-3 bg-white rounded-lg shadow-lg text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-200">
          <ZoomIn size={20} />
        </button>
        <button onClick={zoomOut} className="p-3 bg-white rounded-lg shadow-lg text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-200">
          <ZoomOut size={20} />
        </button>
        <button onClick={resetView} className="p-3 bg-white rounded-lg shadow-lg text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-200" title="Reset View">
          <Maximize size={20} />
        </button>
      </div>

      {/* Helper text overlay when hovering if empty */}
      {points.length === 0 && !hasMoved && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur pointer-events-none z-40">
          Click to add point • Drag to pan • Scroll to zoom
        </div>
      )}
    </div>
  );
};
