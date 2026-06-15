import { useFilterStore } from '../../store/filterStore';
import { RetroToggle } from '../primitives/RetroToggle';

export function Per90Toggle() {
  const { per90, setPer90 } = useFilterStore();
  return <RetroToggle on={per90} onChange={setPer90} label="Per 90 Minutes" />;
}
