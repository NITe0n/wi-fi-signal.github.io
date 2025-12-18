import React, { useState, useCallback } from 'react';
import { WifiPoint, ImageState } from './types.ts';
import { MapCanvas } from './components/MapCanvas.tsx';
import { PointList } from './components/PointList.tsx';
import { generateExport } from './utils/exportHelper.ts';
import { Download, Wifi, RotateCcw, ImagePlus } from 'lucide-react';

const App: React.FC = () => {
  const [points, setPoints] = useState<WifiPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);
  const [imageState, setImageState] = useState<ImageState>({
    src: '',
    width: 0,
    height: 0,
    file: null,
  });

  // Handle Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImageState({
            src: e.target?.result as string,
            width: img.width,
            height: img.height,
            file: file,
          });
          setPoints([]);
          setSelectedPointId(null);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all points and the image?')) {
      setImageState({ src: '', width: 0, height: 0, file: null });
      setPoints([]);
      setSelectedPointId(null);
    }
  };

  // Add Point
  const handleAddPoint = useCallback((x: number, y: number) => {
    // Find the lowest available ID
    const existingIds = new Set(points.map(p => p.id));
    let newId = 1;
    while (existingIds.has(newId)) {
      newId++;
    }

    const newPoint: WifiPoint = {
      id: newId,
      x,
      y,
      dbm: '',
    };
    setPoints((prev) => [...prev, newPoint]);
    setSelectedPointId(newPoint.id);
  }, [points]);

  // Update dBm value
  const handleUpdateDbm = (id: number, value: string) => {
    setPoints((prev) => prev.map(p => p.id === id ? { ...p, dbm: value } : p));
  };

  // Delete Point
  const handleDeletePoint = (id: number) => {
    setPoints((prev) => prev.filter(p => p.id !== id));
    if (selectedPointId === id) setSelectedPointId(null);
  };

  const handleExport = async () => {
    if (points.length === 0) {
      alert("Please add at least one point before exporting.");
      return;
    }
    await generateExport(imageState, points);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-200 shadow-lg">
            <Wifi size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">WiFi Mapper</h1>
            <p className="text-xs text-slate-500 hidden md:block">Signal Strength Analysis Tool</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {imageState.src && (
            <>
              <label className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors hidden md:block" title="Change Image">
                <ImagePlus size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <button 
                onClick={handleReset}
                className="p-2 text-slate-600 hover:bg-slate-100 hover:text-red-600 rounded-lg transition-colors"
                title="Reset All"
              >
                <RotateCcw size={20} />
              </button>
              <div className="h-6 w-px bg-slate-300 mx-2"></div>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-blue-600/20 active:scale-95"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export Report</span>
                <span className="sm:hidden">Export</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Map Area */}
        <section className="flex-1 relative bg-slate-200 h-[60%] md:h-full z-0">
          <MapCanvas 
            imageState={imageState}
            points={points}
            onAddPoint={handleAddPoint}
            onSelectPoint={setSelectedPointId}
            selectedPointId={selectedPointId}
            onUpload={handleImageUpload}
          />
        </section>

        {/* Data/Sidebar Panel */}
        {imageState.src && (
          <aside className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 h-[40%] md:h-full shrink-0 flex flex-col shadow-xl z-10">
             <PointList 
               points={points}
               onUpdateDbm={handleUpdateDbm}
               onDeletePoint={handleDeletePoint}
               selectedPointId={selectedPointId}
               onSelectPoint={setSelectedPointId}
             />
          </aside>
        )}
      </main>
    </div>
  );
};

export default App;
