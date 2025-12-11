// modules\template_generation\admin\Canvas.tsx
import React, { useState, useRef, useEffect } from 'react';

interface EditorElement {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  text?: string;
  font_size?: number;
  font?: string;
  text_color?: string;
  bg_color?: string;
  bg_transparency?: number;
  alignment?: "left" | "center" | "right" | "justify";
  text_wrap?: boolean;
  line_height?: number;
  image_url?: string;
  object_fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  qr_text?: string; // new QR text field
}

interface CanvasProps {
  elements: EditorElement[];
  setElements: (elements: EditorElement[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  backgroundUrl: string | null;
  canvasWidth: number;
  canvasHeight: number;
}

export const ZoomableCanvas: React.FC<CanvasProps> = ({ 
  elements, 
  setElements, 
  selectedId, 
  setSelectedId, 
  backgroundUrl,
  canvasWidth,
  canvasHeight 
}) => {
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const panStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const centerCanvas = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const scaledWidth = canvasWidth * zoom;
    const scaledHeight = canvasHeight * zoom;
    setPanOffset({
      x: (containerWidth - scaledWidth) / 2,
      y: (containerHeight - scaledHeight) / 2
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      centerCanvas();
    }, 10);
    return () => clearTimeout(timer);
  }, [canvasWidth, canvasHeight]);

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const screenToCanvas = (screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - panOffset.x) / zoom,
      y: (screenY - rect.top - panOffset.y) / zoom
    };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = -e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(0.1, zoom * (1 + delta)), 5);
    const zoomRatio = newZoom / zoom;
    const newOffsetX = mouseX - (mouseX - panOffset.x) * zoomRatio;
    const newOffsetY = mouseY - (mouseY - panOffset.y) * zoomRatio;
    setZoom(newZoom);
    setPanOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const zoomRatio = newZoom / zoom;
    const newOffsetX = centerX - (centerX - panOffset.x) * zoomRatio;
    const newOffsetY = centerY - (centerY - panOffset.y) * zoomRatio;
    setZoom(newZoom);
    setPanOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleMouseDown = (e: React.MouseEvent, el?: EditorElement) => {
    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, offsetX: panOffset.x, offsetY: panOffset.y };
      return;
    }
    if (el) {
      e.stopPropagation();
      setSelectedId(el.id);
      setDragging(el.id);
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      dragStart.current = { x: canvasPos.x, y: canvasPos.y, elementX: el.x, elementY: el.y };
    } else if (e.button === 0) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, offsetX: panOffset.x, offsetY: panOffset.y };
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, el: EditorElement) => {
    e.stopPropagation();
    setResizing(el.id);
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    resizeStart.current = { x: canvasPos.x, y: canvasPos.y, width: el.width, height: el.height };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPanOffset({ x: panStart.current.offsetX + dx, y: panStart.current.offsetY + dy });
      return;
    }
    if (dragging) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      updateElement(dragging, {
        x: dragStart.current.elementX + (canvasPos.x - dragStart.current.x),
        y: dragStart.current.elementY + (canvasPos.y - dragStart.current.y),
      });
    }
    if (resizing) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      updateElement(resizing, {
        width: Math.max(50, resizeStart.current.width + (canvasPos.x - resizeStart.current.x)),
        height: Math.max(50, resizeStart.current.height + (canvasPos.y - resizeStart.current.y)),
      });
    }
  };

  const handleMouseUp = () => { setIsPanning(false); setDragging(null); setResizing(null); };
  const handleCanvasClick = (e: React.MouseEvent) => { if (e.target === e.currentTarget && !isPanning) setSelectedId(null); };

  // ---------------- QR Placeholder SVG ----------------
  const QRPlaceholder: React.FC = () => (
    <svg width="100%" height="100%" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="50" height="50" fill="#e0e0e0" />
      <rect x="5" y="5" width="10" height="10" fill="#555" />
      <rect x="35" y="5" width="10" height="10" fill="#555" />
      <rect x="5" y="35" width="10" height="10" fill="#555" />
      <rect x="20" y="20" width="10" height="10" fill="#555" />
      <rect x="35" y="35" width="10" height="10" fill="#555" />
    </svg>
  );

  const renderElement = (el: EditorElement) => {
    if (el.type === "text") {
      return (
        <div className="w-full h-full flex p-2 pointer-events-none"
          style={{
            fontSize: `${el.font_size || 16}px`,
            fontFamily: el.font || 'Arial',
            color: el.text_color || '#000000',
            backgroundColor: el.bg_color || 'transparent',
            textAlign: el.alignment || 'left',
            lineHeight: el.line_height || 1.2,
            whiteSpace: el.text_wrap ? 'normal' : 'nowrap',
            wordWrap: el.text_wrap ? 'break-word' : 'normal',
            overflowWrap: el.text_wrap ? 'break-word' : 'normal',
            alignItems: 'flex-start',
            justifyContent: el.alignment === 'center' ? 'center' : el.alignment === 'right' ? 'flex-end' : 'flex-start',
            opacity: el.bg_transparency !== undefined ? 1 - el.bg_transparency : 1
          }}
        >
          <span>{el.text || 'Text'}</span>
        </div>
      );
    }
    
    if (el.type === "image") {
      // Render placeholder if qr_text exists
      if (el.qr_text?.trim()) {
        return <QRPlaceholder />;
      }
      if (el.image_url) {
        return <img src={el.image_url} className="w-full h-full pointer-events-none" style={{ objectFit: el.object_fit || 'contain' }} alt="element" />;
      }
    }
    
    return null;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div ref={containerRef} className="flex-1 overflow-hidden"
        style={{ background: "#f3f3f3", cursor: isPanning ? 'grabbing' : 'default' }}
        onWheel={handleWheel}
        onMouseDown={(e) => handleMouseDown(e)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, transformOrigin: "0 0", width: canvasWidth, height: canvasHeight, position: 'relative' }}>
          <div ref={canvasRef} className="relative"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
              backgroundColor: backgroundUrl ? undefined : '#ffffff',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onClick={handleCanvasClick}
          >
            {[...elements].sort((a,b) => (a.z_index||0) - (b.z_index||0)).map(el => (
              <div key={el.id} onMouseDown={e => handleMouseDown(e, el)}
                style={{
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  border: el.id === selectedId ? "2px solid #4F46E5" : "1px solid rgba(0,0,0,0.1)",
                  cursor: dragging === el.id ? "grabbing" : "grab",
                }}
              >
                {renderElement(el)}
                {el.id === selectedId && (
                  <div onMouseDown={e => handleResizeMouseDown(e, el)}
                    style={{
                      position: "absolute",
                      right: -6,
                      bottom: -6,
                      width: 14,
                      height: 14,
                      backgroundColor: "#4F46E5",
                      cursor: "nwse-resize",
                      borderRadius: "50%",
                      border: "2px solid white",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="p-2 bg-gray-100 flex items-center gap-4">
        <button onClick={centerCanvas} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm">Center</button>
        <span className="text-sm">Zoom:</span>
        <input type="range" min={0.1} max={5} step={0.1} value={zoom} onChange={handleZoomChange} className="flex-1"/>
        <span className="text-sm w-12">{Math.round(zoom*100)}%</span>
        <div className="text-xs text-gray-500">Scroll to zoom • Drag to pan</div>
      </div>
    </div>
  );
};
