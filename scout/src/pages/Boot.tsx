import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScoutMark } from '../components/primitives/Icons';
import { loadPlayers } from '../lib/data';

const LOGO = 'SCOUT';

export function Boot() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(0); // 0 black,1 logo,2 lines,3 ready
  const [count, setCount] = useState(3145);
  const [flash, setFlash] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem('scout_booted')) {
      navigate('/players', { replace: true });
      return;
    }
    loadPlayers().then((p) => setCount(p.length)).catch(() => {});
    const t1 = setTimeout(() => setStage(1), 170);
    const t2 = setTimeout(() => setStage(2), 300);
    const t3 = setTimeout(() => setStage(3), 660);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [navigate]);

  useEffect(() => {
    const go = () => {
      if (done.current || stage < 3) return;
      done.current = true;
      sessionStorage.setItem('scout_booted', '1');
      setFlash(true);
      setTimeout(() => navigate('/players'), 180);
    };
    window.addEventListener('keydown', go);
    window.addEventListener('click', go);
    return () => {
      window.removeEventListener('keydown', go);
      window.removeEventListener('click', go);
    };
  }, [stage, navigate]);

  const lines = [
    'SCOUT DATABASE TERMINAL v2.1',
    'LOADING DATABASE........... OK',
    `INDEXING ${count.toLocaleString('en-GB')} PLAYERS..... OK`,
    'CONNECTING TO SCOUTING NET. OK',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-bg-deep)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* scanline sweep */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 2,
          background: 'var(--color-accent-cyan)',
          boxShadow: '0 0 12px var(--color-accent-cyan)',
          animation: 'scanline-sweep 120ms ease-in 1',
          opacity: 0.8,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, opacity: stage >= 1 ? 1 : 0 }}>
        <ScoutMark size={48} style={{ color: 'var(--color-accent-amber)' }} />
        <div style={{ display: 'flex' }}>
          {LOGO.split('').map((ch, i) => (
            <span
              key={i}
              className="mono-bold"
              style={{
                fontSize: 64,
                color: 'var(--color-accent-amber)',
                opacity: stage >= 1 ? 1 : 0,
                animation: stage >= 1 ? `scout-fade-in 80ms linear ${i * 60}ms both` : undefined,
                letterSpacing: '-0.02em',
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      <div className="mono" style={{ fontSize: 13, color: 'var(--color-accent-green)', minHeight: 96, lineHeight: 1.8 }}>
        {stage >= 2 &&
          lines.map((ln, i) => (
            <Typewriter key={i} text={ln} delay={i * 110} />
          ))}
      </div>

      <div
        className="label"
        style={{
          marginTop: 28,
          fontSize: 13,
          color: 'var(--color-accent-cyan)',
          opacity: stage >= 3 ? 1 : 0,
          animation: stage >= 3 ? 'blink 1s steps(1) infinite' : undefined,
        }}
      >
        PRESS ANY KEY TO CONTINUE
      </div>

      {flash && (
        <div style={{ position: 'absolute', inset: 0, animation: 'flash-white 180ms ease-out forwards', zIndex: 200 }} />
      )}
    </div>
  );
}

function Typewriter({ text, delay }: { text: string; delay: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        i++;
        setN(i);
        if (i >= text.length) clearInterval(timer);
      }, 8);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [text, delay]);
  return <div>{text.slice(0, n)}</div>;
}
