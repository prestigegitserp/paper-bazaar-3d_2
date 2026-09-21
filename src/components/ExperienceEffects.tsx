import { AdaptiveDpr, SoftShadows } from '@react-three/drei'
import { useAppStore } from '../store'

export default function ExperienceEffects() {
  const quality = useAppStore((state) => state.quality)
  const started = useAppStore((state) => state.started)

  return (
    <>
      <AdaptiveDpr />
      {started && quality === 'cinematic' && (
        <SoftShadows size={11} samples={10} focus={0.36} />
      )}
    </>
  )
}
