import { WifiPoint, ImageState } from '../types';
import * as XLSX from 'xlsx';

export const generateExport = async (
  imageState: ImageState,
  points: WifiPoint[]
) => {
  if (!imageState.src) return;

  // 1. Create a canvas to draw the final composite image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error("Could not get canvas context");
    return;
  }

  // Set canvas size to match original image
  canvas.width = imageState.width;
  canvas.height = imageState.height;

  // Load the image into an HTMLImageElement to draw it
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageState.src;

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });

  // Draw base image
  ctx.drawImage(img, 0, 0);

  // Draw points
  const fontSize = Math.max(20, Math.floor(imageState.width * 0.02)); // Responsive font size
  const radius = fontSize * 1.2;

  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  points.forEach((point) => {
    const px = (point.x / 100) * canvas.width;
    const py = (point.y / 100) * canvas.height;

    // Outer circle (Stroke)
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; // Tailwind red-500
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(point.id.toString(), px, py);
  });

  // 2. Export Image
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  const link = document.createElement('a');
  link.download = 'wifi-map-export.jpg';
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 3. Export Data (XLSX)
  
  // Sort points by ID for cleaner output
  const sortedPoints = [...points].sort((a, b) => a.id - b.id);

  // Create data structure: № Точки | Значение (dBm)
  // Filtering out X/Y coordinates as requested
  const data = sortedPoints.map(p => ({
    "№ Точки": p.id,
    "Мощность (dBm)": p.dbm ? Number(p.dbm) : "" 
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Adjust column widths for better readability
  const wscols = [
    { wch: 10 }, // Width for "№ Точки"
    { wch: 20 }  // Width for "Мощность (dBm)"
  ];
  worksheet['!cols'] = wscols;

  // Create workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "WiFi Data");

  // Write file and trigger download as .xlsx
  XLSX.writeFile(workbook, "wifi-signal-data.xlsx");
};