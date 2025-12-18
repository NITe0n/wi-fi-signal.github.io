import React, { useRef, useEffect } from 'react';
import { WifiPoint } from '../types.ts';
import { Trash2, Signal } from 'lucide-react';

interface PointListProps {
  points: WifiPoint[];
  onUpdateDbm: (id: number, value: string) => void;
  onDeletePoint: (id: number) => void;
  selectedPointId: number | null;
  onSelectPoint: (id: number) => void;
}

export const PointList: React.FC<PointListProps> = ({ 
  points, 
  onUpdateDbm, 
  onDeletePoint,
  selectedPointId,
  onSelectPoint
}) => {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedPointId]);

  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
        <Signal className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No points added</p>
        <p className="text-sm">Tap on the map to add a measurement point.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 sticky top-0 bg-white/95 backdrop-blur py-2 z-10 border-b border-slate-100">
        Measurements ({points.length})
      </h3>
      
      {points.map((point) => {
        const isSelected = selectedPointId === point.id;
        
        return (
          <div 
            key={point.id}
            ref={isSelected ? activeRef : null}
            onClick={() => onSelectPoint(point.id)}
            className={`
              flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer
              ${isSelected 
                ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' 
                : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }
            `}
          >
            {/* ID Badge */}
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0
              ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}
            `}>
              {point.id}
            </div>

            {/* Input Field */}
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-medium block mb-1">
                Signal Strength (dBm)
              </label>
              <input
                type="number"
                value={point.dbm}
                onChange={(e) => onUpdateDbm(point.id, e.target.value)}
                placeholder="-60"
                className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 text-slate-800 font-mono"
                autoFocus={isSelected}
              />
            </div>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeletePoint(point.id);
              }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove Point"
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
