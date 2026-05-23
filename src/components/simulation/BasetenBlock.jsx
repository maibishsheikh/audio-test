import { motion } from 'framer-motion';

/**
 * BasetenBlock SVG Component
 * type: 'flat' (100) | 'rod' (10) | 'unit' (1)
 * Flat: 60×60px gold SVG grid (10×10 mini squares)
 * Rod:  12×60px purple SVG bar (10 stacked squares)
 * Unit: 12×12px blue SVG square
 */
export default function BasetenBlock({ type = 'unit', draggable = false, onDragStart, onClick, placed = false, small = false }) {
  const scale = small ? 0.7 : 1;

  const renderFlat = () => (
    <svg width={60 * scale} height={60 * scale} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="flatShadow">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#00000066" />
        </filter>
      </defs>
      {/* 10x10 grid of mini squares */}
      {Array.from({ length: 10 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 6 + 0.5}
            y={row * 6 + 0.5}
            width={5}
            height={5}
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth={0.5}
            rx={0.5}
          />
        ))
      )}
      {/* 3D bevel top */}
      <rect x={0} y={0} width={60} height={2} fill="rgba(255,255,255,0.3)" rx={1} />
      <rect x={0} y={0} width={2} height={60} fill="rgba(255,255,255,0.3)" />
    </svg>
  );

  const renderRod = () => (
    <svg width={12 * scale} height={60 * scale} viewBox="0 0 12 60" xmlns="http://www.w3.org/2000/svg">
      {/* 10 stacked squares */}
      {Array.from({ length: 10 }).map((_, row) => (
        <rect
          key={row}
          x={0.5}
          y={row * 6 + 0.5}
          width={11}
          height={5}
          fill="#7C3AED"
          stroke="#5B21B6"
          strokeWidth={0.5}
          rx={0.5}
        />
      ))}
      {/* 3D bevel */}
      <rect x={0} y={0} width={12} height={1.5} fill="rgba(255,255,255,0.3)" rx={0.5} />
      <rect x={0} y={0} width={1.5} height={60} fill="rgba(255,255,255,0.3)" />
    </svg>
  );

  const renderUnit = () => (
    <svg width={12 * scale} height={12 * scale} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
      <rect x={0.5} y={0.5} width={11} height={11} fill="#3B82F6" stroke="#2563EB" strokeWidth={0.8} rx={1.5} />
      {/* 3D bevel */}
      <rect x={1} y={1} width={10} height={1.5} fill="rgba(255,255,255,0.4)" rx={0.5} />
      <rect x={1} y={1} width={1.5} height={10} fill="rgba(255,255,255,0.4)" />
    </svg>
  );

  const blockMap = { flat: renderFlat, rod: renderRod, unit: renderUnit };
  const labels = { flat: '100', rod: '10', unit: '1' };

  return (
    <motion.div
      className={`base-ten-block${placed ? ' placed' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      whileHover={draggable || onClick ? { scale: 1.08 } : {}}
      whileTap={draggable || onClick ? { scale: 0.95 } : {}}
      style={{
        cursor: draggable ? 'grab' : onClick ? 'pointer' : 'default',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        userSelect: 'none',
      }}
      title={`${labels[type]} block`}
      aria-label={`Base-ten block: ${labels[type]}`}
    >
      {(blockMap[type] || renderUnit)()}
    </motion.div>
  );
}
