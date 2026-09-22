import { Canvas } from '@react-three/fiber'
import { lazy, Suspense, useEffect } from 'react'
import { AgXToneMapping, SRGBColorSpace } from 'three'
import MallScene from './components/MallScene'
import HUD from './components/HUD'
import { loadRuntimeBundle } from './infrastructure/repositories/runtimeRepositories'
import { useAppStore } from './store'
import { validateWorldDefinition } from './world/validation'

const CatalogReader = lazy(() => import('./features/catalog-reader/CatalogReader'))

function RuntimeLoader() {
  const setRuntimeBundle = useAppStore((state) => state.setRuntimeBundle)
  const setCatalogError = useAppStore((state) => state.setCatalogError)

  useEffect(() => {
    const controller = new AbortController()

    void loadRuntimeBundle(controller.signal)
      .then((bundle) => {
        const issues = validateWorldDefinition(bundle.world, bundle.catalog)
        if (issues.length) console.error('[world-validation]', issues)
        setRuntimeBundle(bundle)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : 'Runtime content unavailable'
        setCatalogError(message)
      })

    return () => controller.abort()
  }, [setCatalogError, setRuntimeBundle])

  return null
}

export default function App() {
  const quality = useAppStore((state) => state.quality)
  const world = useAppStore((state) => state.world)
  const started = useAppStore((state) => state.started)
  const documentOpen = useAppStore((state) => state.selected?.kind === 'document')

  return (
    <main className="app-shell">
      <RuntimeLoader />
      <Canvas
        shadows={started && quality === 'cinematic'}
        dpr={started
          ? quality === 'cinematic'
            ? [0.82, 1.28]
            : [0.62, 1.0]
          : [0.62, 0.86]}
        frameloop="demand"
        performance={{
          min: started ? (quality === 'cinematic' ? 0.58 : 0.68) : 1,
          max: 1,
          debounce: 850
        }}
        camera={{ fov: 66, near: 0.08, far: 90, position: world.spawn as [number, number, number] }}
        gl={{ antialias: quality === 'cinematic', powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = AgXToneMapping
          gl.toneMappingExposure = 1.0
          gl.outputColorSpace = SRGBColorSpace
        }}
      >
        <Suspense fallback={null}>
          <MallScene />
        </Suspense>
      </Canvas>
      <HUD />
      {documentOpen && (
        <Suspense fallback={null}>
          <CatalogReader />
        </Suspense>
      )}
    </main>
  )
}
