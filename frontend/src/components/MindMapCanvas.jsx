import { useEffect, useMemo, useRef, useState } from "react";
import { MindNode } from "./MindNode";

const clampScale = (value) => Math.min(2.4, Math.max(0.45, value));

export function MindMapCanvas({
  orientation,
  title,
  subtitle,
  allowHeaderActions = false,
  freeViewEnabled = false,
  onToggleFreeView,
  onToggleOrientation,
  ...nodeProps
}) {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const dragStateRef = useRef({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === canvasRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!canvasRef.current) {
      return;
    }

    if (document.fullscreenElement === canvasRef.current) {
      await document.exitFullscreen();
      return;
    }

    await canvasRef.current.requestFullscreen();
  };

  const zoomBy = (delta) => {
    setScale((current) => clampScale(current + delta));
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const onWheel = (event) => {
    if (!freeViewEnabled) {
      return;
    }

    event.preventDefault();
    const nextScale = clampScale(scale + (event.deltaY < 0 ? 0.08 : -0.08));
    setScale(nextScale);
  };

  const onPointerDown = (event) => {
    if (!freeViewEnabled) {
      return;
    }

    if (event.target.closest(".node-card")) {
      return;
    }

    dragStateRef.current = {
      dragging: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y
    };
  };

  const onPointerMove = (event) => {
    if (!freeViewEnabled) {
      return;
    }

    if (!dragStateRef.current.dragging) {
      return;
    }

    setOffset({
      x: dragStateRef.current.originX + (event.clientX - dragStateRef.current.startX),
      y: dragStateRef.current.originY + (event.clientY - dragStateRef.current.startY)
    });
  };

  const onPointerUp = () => {
    dragStateRef.current.dragging = false;
  };

  const contentStyle = useMemo(
    () =>
      freeViewEnabled
        ? {
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "top left"
          }
        : undefined,
    [freeViewEnabled, offset, scale]
  );

  return (
    <section
      ref={canvasRef}
      className={`canvas-card canvas-card-${orientation} ${freeViewEnabled ? "canvas-card-freeview" : ""}`}
    >
      <div className="canvas-header">
        <div>
          <p className="eyebrow">{subtitle || "Mind Map"}</p>
          <h2>{title || "Concept Flow"}</h2>
        </div>

        {allowHeaderActions && freeViewEnabled ? (
          <div className="canvas-actions">
            <button className="ghost-button" type="button" onClick={onToggleFreeView}>
              Exit Free View
            </button>
            <button className="ghost-button" type="button" onClick={() => zoomBy(-0.1)}>
              Zoom Out
            </button>
            <button className="ghost-button" type="button" onClick={() => zoomBy(0.1)}>
              Zoom In
            </button>
            <button className="ghost-button" type="button" onClick={resetView}>
              Reset View
            </button>
            <button className="ghost-button" type="button" onClick={onToggleOrientation}>
              {orientation === "vertical" ? "Horizontal Mode" : "Vertical Mode"}
            </button>
            <button className="ghost-button" type="button" onClick={toggleFullscreen}>
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={viewportRef}
        className={`mind-viewport mind-viewport-${orientation} ${
          freeViewEnabled ? "mind-viewport-free" : "mind-viewport-static"
        }`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div className={`mind-tree mind-tree-${orientation}`} style={contentStyle}>
          <MindNode {...nodeProps} orientation={orientation} />
        </div>
      </div>
    </section>
  );
}
