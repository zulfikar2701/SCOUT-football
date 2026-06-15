import { Diamond } from './Icons';

// 5 diamonds, filled by quality (rating/10 -> 5 diamonds) (§4.4)
export function DiamondRating({ value, max = 10, size = 12 }: { value: number; max?: number; size?: number }) {
  const stars = Math.round((value / max) * 5 * 2) / 2; // nearest half
  return (
    <span style={{ display: 'inline-flex', gap: 2 }} aria-label={`${stars} of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const full = stars >= i + 1;
        const half = !full && stars >= i + 0.5;
        if (half) {
          return (
            <span key={i} style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
              <span style={{ position: 'absolute', inset: 0 }}>
                <Diamond size={size} filled={false} />
              </span>
              <span style={{ position: 'absolute', inset: 0, width: size / 2, overflow: 'hidden' }}>
                <Diamond size={size} filled />
              </span>
            </span>
          );
        }
        return <Diamond key={i} size={size} filled={full} />;
      })}
    </span>
  );
}
