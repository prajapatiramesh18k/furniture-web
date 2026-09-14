interface Props {
  icon: string;
  value: string;
  label: string;
  sub?: string;
  delta?: string;
  deltaTone?: 'up' | 'down' | 'flat';
  accent?: string;
  accentSoft?: string;
}

export default function DashboardCard({ icon, value, label, sub, delta, deltaTone = 'flat', accent, accentSoft }: Props) {
  return (
    <div className="ahf-stat" style={{ ['--ahf-accent' as string]: accent, ['--ahf-accent-soft' as string]: accentSoft }}>
      <div className="ahf-stat-top">
        <span className="ahf-stat-ic">
          <i className={`fas ${icon}`}></i>
        </span>
        {delta && <span className={`ahf-delta ${deltaTone}`}>{delta}</span>}
      </div>
      <div className="ahf-stat-num">{value}</div>
      <div className="ahf-stat-label">{label}</div>
      {sub && <div className="ahf-stat-sub">{sub}</div>}
    </div>
  );
}
