import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Download, RefreshCw, Eye } from 'lucide-react';

export interface GraphNode {
  id: string;
  label: string;
  sublabel?: string; // Equivalence class representation, e.g. "[q0, q1]"
  isStart: boolean;
  isFinal: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  labels: string[]; // Combined labels, e.g. ['0', '1'] -> "0, 1"
}

interface DFAGraphCanvasProps {
  title: string;
  subtitle?: string;
  badge?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  height?: number;
}

export const DFAGraphCanvas: React.FC<DFAGraphCanvasProps> = ({
  title,
  subtitle,
  badge,
  nodes: initialNodes,
  edges,
  height = 440,
}) => {
  const markerId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const nodeRadius = 32;

  // Node positions (mutable for dragging)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover state for interactive highlighting
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Initialize node layout with start state on left side and even circular distribution
  const initializeLayout = useCallback(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const n = initialNodes.length;
    if (n === 0) return;

    const width = containerRef.current?.clientWidth || 580;
    const centerX = width / 2;
    const centerY = height / 2;

    if (n === 1) {
      positions[initialNodes[0].id] = { x: centerX, y: centerY };
    } else if (n === 2) {
      // Place start state on left, second on right
      const startIdx = initialNodes.findIndex((node) => node.isStart);
      const first = startIdx >= 0 ? initialNodes[startIdx] : initialNodes[0];
      const second = initialNodes.find((node) => node.id !== first.id)!;
      positions[first.id] = { x: centerX - 120, y: centerY };
      positions[second.id] = { x: centerX + 120, y: centerY };
    } else {
      // Find start node index
      const startIdx = initialNodes.findIndex((node) => node.isStart);
      // Order nodes starting with start state, so start state sits on the left at angle Math.PI
      const orderedNodes = [...initialNodes];
      if (startIdx > 0) {
        const [startNode] = orderedNodes.splice(startIdx, 1);
        orderedNodes.unshift(startNode);
      }

      // Radius scaled with number of nodes
      const radiusX = Math.min(centerX - 80, Math.max(130, 60 + n * 26));
      const radiusY = Math.min(centerY - 70, Math.max(105, 45 + n * 20));

      orderedNodes.forEach((node, i) => {
        // Start node (i=0) is placed at angle PI (9 o'clock / left side)
        // Others go clockwise: angle = PI - (2 * PI * i) / n
        const angle = Math.PI - (2 * Math.PI * i) / n;
        positions[node.id] = {
          x: Math.round(centerX + radiusX * Math.cos(angle)),
          y: Math.round(centerY - radiusY * Math.sin(angle)),
        };
      });
    }

    setNodePositions(positions);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [initialNodes, height]);

  useEffect(() => {
    initializeLayout();
  }, [initializeLayout]);

  // Fit to screen / center view
  const handleFitToView = () => {
    const keys = Object.keys(nodePositions);
    if (keys.length === 0) return;

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    keys.forEach((id) => {
      const p = nodePositions[id];
      if (p) {
        minX = Math.min(minX, p.x - nodeRadius - 40);
        maxX = Math.max(maxX, p.x + nodeRadius + 40);
        minY = Math.min(minY, p.y - nodeRadius - 40);
        maxY = Math.max(maxY, p.y + nodeRadius + 40);
      }
    });

    const w = containerRef.current?.clientWidth || 580;
    const h = height;
    const graphW = maxX - minX || 1;
    const graphH = maxY - minY || 1;

    const scale = Math.min(1.4, Math.max(0.6, Math.min((w - 40) / graphW, (h - 40) / graphH)));
    const targetCenterX = (minX + maxX) / 2;
    const targetCenterY = (minY + maxY) / 2;

    setZoom(scale);
    setPan({
      x: w / 2 - targetCenterX * scale,
      y: h / 2 - targetCenterY * scale,
    });
  };

  // Pan handlers
  const handleMouseDownSvg = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNodeId) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMoveSvg = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - pan.x) / zoom;
      const currentY = (e.clientY - rect.top - pan.y) / zoom;

      setNodePositions((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: Math.round(currentX - dragOffset.x),
          y: Math.round(currentY - dragOffset.y),
        },
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUpSvg = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node drag start
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    const pos = nodePositions[nodeId] || { x: 0, y: 0 };
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = (e.clientX - rect.left - pan.x) / zoom;
      const clickY = (e.clientY - rect.top - pan.y) / zoom;
      setDragOffset({
        x: clickX - pos.x,
        y: clickY - pos.y,
      });
    }
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(2.5, Math.max(0.4, Number((prev * zoomFactor).toFixed(2)))));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Download SVG
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_graph.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div className="bg-slate-950/85 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl flex flex-col transition">
      {/* Title & Toolbar */}
      <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 select-none">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h4>
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 border border-blue-800/60 text-blue-300">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Zoom, Auto-Layout & Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={initializeLayout}
            className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-[11px] font-medium transition"
            title="Auto-organize node layout"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Auto Layout</span>
          </button>

          <button
            onClick={handleFitToView}
            className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-[11px] font-medium transition"
            title="Fit graph to viewport"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Fit View</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs text-slate-400">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
              className="p-1 rounded-lg hover:text-white hover:bg-slate-800 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] px-1 text-slate-300 min-w-9 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
              className="p-1 rounded-lg hover:text-white hover:bg-slate-800 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-slate-800 mx-0.5" />
            <button
              onClick={handleResetView}
              className="p-1 rounded-lg hover:text-white hover:bg-slate-800 transition"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportSVG}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-lg transition"
            title="Export Graph as SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-radial from-slate-900/40 via-slate-950 to-slate-950 cursor-grab active:cursor-grabbing select-none"
        style={{ height }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          onMouseDown={handleMouseDownSvg}
          onMouseMove={handleMouseMoveSvg}
          onMouseUp={handleMouseUpSvg}
          onMouseLeave={handleMouseUpSvg}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <defs>
            {/* Regular Arrowhead */}
            <marker
              id={`arrow-${markerId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#60a5fa" />
            </marker>

            {/* Start Arrowhead */}
            <marker
              id={`arrow-start-${markerId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>

            {/* Self Loop Arrowhead */}
            <marker
              id={`arrow-loop-${markerId}`}
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#818cf8" />
            </marker>

            {/* Drop Shadow for Nodes */}
            <filter id={`shadow-${markerId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Group transformed by Zoom & Pan */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* RENDER EDGES */}
            {edges.map((edge) => {
              const fromPos = nodePositions[edge.from];
              const toPos = nodePositions[edge.to];
              if (!fromPos || !toPos) return null;

              const edgeKey = `${edge.from}->${edge.to}`;
              const labelText = edge.labels.join(', ');

              const isEdgeHighlighted =
                hoveredNodeId !== null &&
                (hoveredNodeId === edge.from || hoveredNodeId === edge.to);
              const isDimmed =
                hoveredNodeId !== null &&
                hoveredNodeId !== edge.from &&
                hoveredNodeId !== edge.to;

              // 1. SELF-LOOP
              if (edge.from === edge.to) {
                const topX = fromPos.x;
                const topY = fromPos.y - nodeRadius;
                // Cubic Bezier loop arching above node
                const loopPath = `M ${topX - 14} ${topY + 2} C ${topX - 38} ${topY - 46}, ${topX + 38} ${topY - 46}, ${topX + 14} ${topY + 2}`;

                return (
                  <g
                    key={edgeKey}
                    className={`transition-opacity duration-200 ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                  >
                    <path
                      d={loopPath}
                      fill="none"
                      stroke={isEdgeHighlighted ? '#a5b4fc' : '#818cf8'}
                      strokeWidth={isEdgeHighlighted ? '2.8' : '2'}
                      markerEnd={`url(#arrow-loop-${markerId})`}
                      className="transition-colors"
                    />
                    {/* Edge Label Badge */}
                    <g transform={`translate(${topX}, ${topY - 48})`}>
                      <rect
                        x={-Math.max(16, labelText.length * 4.5 + 8)}
                        y="-10"
                        width={Math.max(32, labelText.length * 9 + 16)}
                        height="20"
                        rx="6"
                        fill="#0b0f19"
                        stroke={isEdgeHighlighted ? '#a5b4fc' : '#6366f1'}
                        strokeWidth="1.4"
                        className="filter drop-shadow-sm"
                      />
                      <text
                        x="0"
                        y="3.5"
                        fontFamily="ui-monospace, monospace"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#c7d2fe"
                        textAnchor="middle"
                        className="select-none"
                      >
                        {labelText}
                      </text>
                    </g>
                  </g>
                );
              }

              // 2. DIRECTED TRANSITION EDGE BETWEEN DIFFERENT NODES
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const dist = Math.hypot(dx, dy) || 1;

              // Normal vector pointing left relative to travel direction
              const nx = -dy / dist;
              const ny = dx / dist;

              // Check if reverse edge exists (u -> v and v -> u)
              const hasReverse = edges.some((e) => e.from === edge.to && e.to === edge.from);
              const curveOffset = hasReverse ? 38 : 16;

              // Quadratic Bezier Control Point
              const midX = (fromPos.x + toPos.x) / 2 + nx * curveOffset;
              const midY = (fromPos.y + toPos.y) / 2 + ny * curveOffset;

              // Tangent intersection with node circles
              const sx = midX - fromPos.x;
              const sy = midY - fromPos.y;
              const sDist = Math.hypot(sx, sy) || 1;
              const startX = fromPos.x + (sx / sDist) * nodeRadius;
              const startY = fromPos.y + (sy / sDist) * nodeRadius;

              const ex = toPos.x - midX;
              const ey = toPos.y - midY;
              const eDist = Math.hypot(ex, ey) || 1;
              const endX = toPos.x - (ex / eDist) * (nodeRadius + 4);
              const endY = toPos.y - (ey / eDist) * (nodeRadius + 4);

              const edgePath = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

              // Apex of quadratic curve at t = 0.5
              const apexX = 0.25 * startX + 0.5 * midX + 0.25 * endX;
              const apexY = 0.25 * startY + 0.5 * midY + 0.25 * endY;

              return (
                <g
                  key={edgeKey}
                  className={`transition-opacity duration-200 ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                >
                  <path
                    d={edgePath}
                    fill="none"
                    stroke={isEdgeHighlighted ? '#93c5fd' : '#60a5fa'}
                    strokeWidth={isEdgeHighlighted ? '2.8' : '2'}
                    markerEnd={`url(#arrow-${markerId})`}
                    className="transition-colors"
                  />

                  {/* Combined Transition Label Badge */}
                  <g transform={`translate(${apexX}, ${apexY})`}>
                    <rect
                      x={-Math.max(15, labelText.length * 4.5 + 7)}
                      y="-9.5"
                      width={Math.max(30, labelText.length * 9 + 14)}
                      height="19"
                      rx="6"
                      fill="#0b0f19"
                      stroke={isEdgeHighlighted ? '#93c5fd' : '#3b82f6'}
                      strokeWidth="1.3"
                      className="filter drop-shadow-sm"
                    />
                    <text
                      x="0"
                      y="3.5"
                      fontFamily="ui-monospace, monospace"
                      fontSize="10.5"
                      fontWeight="bold"
                      fill="#93c5fd"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {labelText}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* RENDER NODES */}
            {initialNodes.map((node) => {
              const pos = nodePositions[node.id] || { x: 300, y: 220 };
              const isSelected = draggingNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-move group"
                >
                  {/* Start State Indicator Arrow */}
                  {node.isStart && (
                    <g transform={`translate(-${nodeRadius + 36}, 0)`}>
                      <line
                        x1="-14"
                        y1="0"
                        x2="26"
                        y2="0"
                        stroke="#38bdf8"
                        strokeWidth="2.8"
                        markerEnd={`url(#arrow-start-${markerId})`}
                      />
                      <text
                        x="-20"
                        y="3.5"
                        fontFamily="system-ui, sans-serif"
                        fontSize="10"
                        fontWeight="bold"
                        fill="#38bdf8"
                        textAnchor="end"
                        className="select-none pointer-events-none"
                      >
                        start
                      </text>
                    </g>
                  )}

                  {/* Node Outer Circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r={nodeRadius}
                    fill={node.isFinal ? '#042f2e' : '#0f172a'}
                    stroke={
                      isSelected
                        ? '#38bdf8'
                        : isHovered
                        ? '#60a5fa'
                        : node.isFinal
                        ? '#10b981'
                        : node.isStart
                        ? '#3b82f6'
                        : '#64748b'
                    }
                    strokeWidth={isSelected || isHovered ? 3.5 : 2.5}
                    filter={`url(#shadow-${markerId})`}
                    className="transition-colors"
                  />

                  {/* Accepting / Final State: Standard Double Circle Ring */}
                  {node.isFinal && (
                    <circle
                      cx="0"
                      cy="0"
                      r={nodeRadius - 6}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  )}

                  {/* Primary State Label */}
                  <text
                    x="0"
                    y={node.sublabel ? -4 : 4.5}
                    fontFamily="ui-monospace, monospace"
                    fontSize={node.sublabel ? '15' : node.label.length > 3 ? '13' : '15'}
                    fontWeight="800"
                    fill={node.isFinal ? '#6ee7b7' : '#ffffff'}
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {node.label}
                  </text>

                  {/* Sublabel for Minimized DFA (Equivalence Class [q0, q1]) */}
                  {node.sublabel && (
                    <text
                      x="0"
                      y="13"
                      fontFamily="ui-monospace, monospace"
                      fontSize="10.5"
                      fontWeight="600"
                      fill="#94a3b8"
                      textAnchor="middle"
                      className="select-none pointer-events-none"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Interactive Canvas Legend & Helper Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 font-sans pointer-events-none">
          <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Start</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-400 inline-block" />
              <span>Accepting (Double)</span>
            </span>
            <span className="text-slate-500 hidden sm:inline">| Drag nodes to reposition</span>
          </div>

          <div className="text-[10px] text-slate-500 hidden md:block">
            Scroll to zoom · Drag canvas to pan
          </div>
        </div>
      </div>
    </div>
  );
};
