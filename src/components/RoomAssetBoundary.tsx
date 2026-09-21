import { Html } from '@react-three/drei'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useAppStore } from '../store'
import type { RoomDefinition } from '../world/types'

type Props = {
  room: RoomDefinition
  children: ReactNode
}

type State = {
  failed: boolean
  message: string
}

export default class RoomAssetBoundary extends Component<Props, State> {
  state: State = { failed: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return {
      failed: true,
      message: error instanceof Error ? error.message : 'Unknown asset error'
    }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    const message = error instanceof Error ? error.message : String(error)
    useAppStore.getState().reportAssetError(this.props.room.id, message)
    console.error('[room-asset]', this.props.room.id, error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    const { room } = this.props
    return (
      <group position={room.position as [number, number, number]} rotation={[0, room.rotationY, 0]}>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[3.8, 3.2, 3.8]} />
          <meshStandardMaterial color="#4b1622" emissive="#7f1d1d" emissiveIntensity={0.25} wireframe />
        </mesh>
        <Html center position={[0, 3.6, 0]} distanceFactor={9} style={{ pointerEvents: 'none' }}>
          <div className="asset-error-card">
            <strong>Asset fallback</strong>
            <span>{room.label}</span>
            <small>{this.state.message.slice(0, 120)}</small>
          </div>
        </Html>
      </group>
    )
  }
}
