import { useGame } from '../../context/GameContext';

export default function AudioToggle({ inline = false }) {
  const { audioEnabled, toggleAudio } = useGame();

  const base = {
    background:'rgba(26,18,68,0.88)',
    backdropFilter:'blur(10px)',
    border:'1px solid rgba(255,255,255,0.18)',
    borderRadius:'50%',
    display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer',
    fontSize:'1.2rem',
    transition:'all 0.22s ease',
  };

  if (inline) {
    return (
      <button
        onClick={toggleAudio}
        title={audioEnabled ? 'Mute audio' : 'Enable audio'}
        style={{ ...base, width:34, height:34, fontSize:'1rem', position:'static' }}
      >
        {audioEnabled ? '🔊' : '🔇'}
      </button>
    );
  }

  return (
    <button
      className="audio-toggle"
      onClick={toggleAudio}
      title={audioEnabled ? 'Mute audio' : 'Enable audio'}
    >
      {audioEnabled ? '🔊' : '🔇'}
    </button>
  );
}
