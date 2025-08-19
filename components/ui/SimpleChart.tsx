/**
 * Lightweight CSS-based chart components
 * Replaces heavy recharts library for better bundle size
 */

interface ChartData {
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  [key: string]: any;
}

interface SimpleLineChartProps {
  data: ChartData[];
  dataKey: string;
  stroke?: string;
  height?: number;
}

export function SimpleLineChart({ 
  data, 
  dataKey, 
  stroke = "#0B2A4A", 
  height = 200 
}: SimpleLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-surface rounded-lg border"
        style={{ height: `${height}px` }}
      >
        <p className="text-text-muted">No data available</p>
      </div>
    );
  }

  const values = data.map(d => d[dataKey]).filter(v => v !== undefined && v !== null);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d[dataKey] - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      {/* Chart container */}
      <div 
        className="relative bg-surface rounded-lg border p-4"
        style={{ height: `${height}px` }}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Line */}
          <polyline
            fill="none"
            stroke={stroke}
            strokeWidth="0.5"
            points={points}
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d[dataKey] - minValue) / range) * 100;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="0.5"
                fill={stroke}
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-text-muted py-2">
          <span>{maxValue.toFixed(1)}</span>
          <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
          <span>{minValue.toFixed(1)}</span>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-text-muted mt-2 px-4">
        <span>{data[0]?.date}</span>
        {data.length > 2 && (
          <span>{data[Math.floor(data.length / 2)]?.date}</span>
        )}
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

export function SimpleBarChart({ 
  data, 
  dataKey, 
  stroke = "#0B2A4A", 
  height = 200 
}: SimpleLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-surface rounded-lg border"
        style={{ height: `${height}px` }}
      >
        <p className="text-text-muted">No data available</p>
      </div>
    );
  }

  const values = data.map(d => d[dataKey]).filter(v => v !== undefined && v !== null);
  const maxValue = Math.max(...values);

  return (
    <div className="w-full">
      <div 
        className="relative bg-surface rounded-lg border p-4"
        style={{ height: `${height}px` }}
      >
        <div className="h-full flex items-end justify-between gap-1">
          {data.map((d, i) => {
            const height = (d[dataKey] / maxValue) * 100;
            return (
              <div
                key={i}
                className="flex-1 rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${height}%`,
                  backgroundColor: stroke,
                  minHeight: '2px'
                }}
                title={`${d.date}: ${d[dataKey]}`}
              />
            );
          })}
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-text-muted mt-2 px-4">
        <span>{data[0]?.date}</span>
        {data.length > 2 && (
          <span>{data[Math.floor(data.length / 2)]?.date}</span>
        )}
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

// Wrapper components for easy replacement
export const LineChart = ({ children, data, ...props }: any) => null;
export const Line = (props: any) => null;
export const XAxis = (props: any) => null;
export const YAxis = (props: any) => null;
export const CartesianGrid = (props: any) => null;
export const Tooltip = (props: any) => null;
export const ResponsiveContainer = ({ children }: any) => children;
export const BarChart = ({ children, data, ...props }: any) => null;
export const Bar = (props: any) => null;