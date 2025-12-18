import React, { useRef, useState } from 'react';
import { WifiPoint, ImageState } from '../types';
import { Image as ImageIcon, Plus } from 'lucide-react';

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
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageState.src || !containerRef.current) return;
    
    // Avoid adding point if clicking on an existing pin
    if ((e.target as HTMLElement).closest('.map-pin')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onAddPoint(x, y);
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
    <div className="relative w-full h-full bg-slate-200 overflow-auto flex items-center justify-center">
      <div 
        ref={containerRef}
        className={`relative shadow-2xl transition-cursor ${isHovering ? 'cursor-crosshair' : ''}`}
        style={{ 
          maxWidth: '100%',
          maxHeight: '100%' 
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* The Base Image */}
        <img 
          src={imageState.src} 
          alt="Floor Plan" 
          className="block max-w-none h-auto select-none"
          style={{ 
            maxHeight: '85vh', 
            objectFit: 'contain' 
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
            className={`map-pin absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-110 cursor-pointer ${
              selectedPointId === point.id 
                ? 'w-10 h-10 bg-blue-600 border-white text-white z-20 scale-110' 
                : 'w-8 h-8 bg-red-500 border-white text-white z-10 opacity-90 hover:opacity-100'
            }`}
            style={{ 
              left: `${point.x}%`, 
              top: `${point.y}%`,
            }}
          >
            <span className="font-bold text-sm leading-none">{point.id}</span>
            
            {/* Tooltip for dBm if entered */}
            {point.dbm && (
              <div className="absolute top-full mt-1 px-2 py-0.5 bg-black/75 text-white text-[10px] rounded whitespace-nowrap pointer-events-none">
                {point.dbm} dBm
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Helper text overlay when hovering if empty */}
      {points.length === 0 && isHovering && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur pointer-events-none">
          Click anywhere to place the first point
        </div>
      )}
    </div>
  );
};
