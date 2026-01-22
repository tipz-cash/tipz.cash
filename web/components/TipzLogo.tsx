"use client";

interface TipzLogoProps {
  size?: number;
  color?: string;
  glowColor?: string;
  className?: string;
}

// Renders [TIPZ] with Zcash-style Z (horizontal bars above and below)
export function TipzLogo({
  size = 18,
  color = "#F5A623",
  glowColor = "rgba(245, 166, 35, 0.15)",
  className
}: TipzLogoProps) {
  return (
    <span
      className={className}
      style={{
        color,
        fontWeight: 700,
        fontSize: `${size}px`,
        fontFamily: "'JetBrains Mono', monospace",
        textShadow: `0 0 20px ${glowColor}`,
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      [TIP
      <ZcashZ size={size} color={color} />
      ]
    </span>
  );
}

// Zcash-style Z with square cubes above and below
function ZcashZ({ size = 18, color = "#F5A623" }: { size?: number; color?: string }) {
  const w = size * 0.5;        // narrower to match letter width
  const h = size * 0.78;       // taller to align with cap height
  const stroke = size * 0.12;  // Z stroke thickness
  const cubeSize = stroke;     // square cubes same as stroke weight

  const totalH = h + cubeSize * 2;

  return (
    <svg
      width={w}
      height={totalH}
      viewBox={`0 0 ${w} ${totalH}`}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        marginLeft: "1px",
        marginRight: "0px",
      }}
    >
      {/* Square cube above */}
      <rect x={(w - cubeSize) / 2} y={0} width={cubeSize} height={cubeSize} fill={color} />

      {/* Z letter as single polygon with proper triangular corners */}
      <g transform={`translate(0, ${cubeSize})`}>
        <polygon
          points={`
            0,0
            ${w},0
            ${w},${stroke}
            ${stroke * 1.6},${h - stroke}
            ${w},${h - stroke}
            ${w},${h}
            0,${h}
            0,${h - stroke}
            ${w - stroke * 1.6},${stroke}
            0,${stroke}
          `}
          fill={color}
        />
      </g>

      {/* Square cube below */}
      <rect x={(w - cubeSize) / 2} y={cubeSize + h} width={cubeSize} height={cubeSize} fill={color} />
    </svg>
  );
}
