import { useGame } from '../../context/GameContext';

const PHASES = [
  { id:'wonder',   icon:'🔍', label:'Wonder',   num:'01' },
  { id:'story',    icon:'📖', label:'Story',     num:'02' },
  { id:'simulate', icon:'✏️', label:'Simulate', num:'03' },
  { id:'play',     icon:'🎮', label:'Play',      num:'04' },
  { id:'reflect',  icon:'⭐', label:'Reflect',   num:'05' },
];
const ORDER = ['intro','wonder','story','simulate','play','reflect'];

export default function PhaseNav() {
  const { phase } = useGame();
  if (phase === 'intro') return null;

  const cur = ORDER.indexOf(phase);

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{
        display:'flex', alignItems:'center',
        background:'rgba(8,8,32,0.75)',
        backdropFilter:'blur(14px)',
        border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:50, padding:'5px 12px',
        gap:0,
      }}>
        {PHASES.map((p, idx) => {
          const stepIdx   = ORDER.indexOf(p.id);
          const completed = stepIdx < cur;
          const active    = stepIdx === cur;

          return (
            <div key={p.id} style={{ display:'flex', alignItems:'center' }}>
              {/* Step pill */}
              <div style={{
                display:'flex', alignItems:'center', gap:5,
                padding: active ? '5px 12px' : '5px 8px',
                borderRadius:50,
                background: active ? 'rgba(245,158,11,0.18)' : 'transparent',
                transition:'all 0.3s',
              }}>
                {/* Circle */}
                <div style={{
                  width:22, height:22, borderRadius:'50%', flexShrink:0,
                  background: completed ? '#10B981' : active ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: completed ? '0.7rem' : '0.68rem',
                  fontWeight:900,
                  color: completed || active ? '#fff' : 'rgba(255,255,255,0.35)',
                  transition:'all 0.3s',
                }}>
                  {completed ? '✓' : p.num}
                </div>

                {/* Label only for active + completed */}
                {(active || completed) && (
                  <span style={{
                    fontSize:'0.75rem',
                    fontWeight: active ? 800 : 600,
                    color: active ? '#F59E0B' : 'rgba(255,255,255,0.5)',
                    whiteSpace:'nowrap',
                    fontFamily:'var(--font-body)',
                  }}>
                    {p.icon} {p.label}
                  </span>
                )}
                {/* Upcoming — icon + label at reduced opacity */}
                {!active && !completed && (
                  <span style={{
                    fontSize:'0.73rem', fontWeight:500,
                    color:'rgba(255,255,255,0.28)', whiteSpace:'nowrap',
                    fontFamily:'var(--font-body)',
                  }}>
                    {p.icon} {p.label}
                  </span>
                )}
              </div>

              {/* Connector */}
              {idx < PHASES.length - 1 && (
                <div style={{
                  width:18, height:2, margin:'0 1px',
                  background: stepIdx < cur ? '#10B981' : 'rgba(255,255,255,0.13)',
                  borderRadius:1, transition:'background 0.3s',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
