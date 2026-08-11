const BAR_W = 8;
const GAP = 2;
const CHART_H = 42;
const WIDTH = 24 * (BAR_W + GAP) - GAP;

export default function HourlyChart({ buckets, unitLabel }) {
  const max = Math.max(...buckets, 1);
  const peakCount = Math.max(...buckets);
  const peakHour = buckets.indexOf(peakCount);

  return (
    <div className="admin-chart">
      <p className="admin-chart-title">
        Por horário
        {peakCount > 0 && (
          <span className="admin-chart-peak"> &middot; pico às {peakHour}h ({peakCount})</span>
        )}
      </p>
      <svg
        className="admin-chart-svg"
        viewBox={`0 0 ${WIDTH} ${CHART_H + 14}`}
        role="img"
        aria-label={
          peakCount > 0
            ? `Distribuição por horário (fuso de Brasília). Pico às ${peakHour}h com ${peakCount} ${unitLabel}.`
            : `Sem dados suficientes ainda para mostrar horário de pico.`
        }
      >
        {buckets.map((count, hour) => {
          const h = Math.max((count / max) * CHART_H, 3);
          const x = hour * (BAR_W + GAP);
          const y = CHART_H - h;
          const isPeak = count === peakCount && count > 0;
          const isLow = count === 0;
          const barClass = isPeak
            ? "admin-chart-bar admin-chart-bar-peak"
            : isLow
            ? "admin-chart-bar admin-chart-bar-low"
            : "admin-chart-bar";
          return (
            <g key={hour}>
              <rect x={x} y={y} width={BAR_W} height={h} rx="1.5" className={barClass}>
                <title>{`${hour}h — ${count} ${unitLabel}`}</title>
              </rect>
              {hour % 4 === 0 && (
                <text x={x + BAR_W / 2} y={CHART_H + 11} className="admin-chart-tick" textAnchor="middle">
                  {hour}h
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
