import type { Vendor } from '../../domain/catalog'
import { getBoothProfile } from '../../world/boothProfiles'
import type { RoomDefinition } from '../../world/types'
import RetailShell from './RetailShell'
import LivedInDetails from './LivedInDetails'
import {
  BookWall,
  CardboardStacks,
  CatalogProp,
  CeilingFan,
  PalletStack,
  Pegboard,
  PriceBoard,
  PrintFrames,
  ProductPaperStack,
  ProductSampleRail,
  RollRack,
  SalesCounter,
  SampleWall,
  ScanLab,
  SideDisplay,
  StockWall,
  SwatchFan,
  resolveProductInteractions
} from './RetailFixtures'

export default function RetailBooth({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  const profile = getBoothProfile(room.experience?.profileId)
  const productA = vendor?.products[0]
  const productB = vendor?.products[1]
  const interactions = resolveProductInteractions(room, vendor)

  return (
    <group position={room.position as [number, number, number]} rotation={[0, room.rotationY, 0]}>
      <RetailShell room={room} vendor={vendor} profile={profile} />

      {profile.template !== 'scan-lab' && <StockWall room={room} profile={profile} />}
      <SalesCounter room={room} vendor={vendor} profile={profile} />
      <PriceBoard room={room} vendor={vendor} profile={profile} />
      <CatalogProp room={room} vendor={vendor} profile={profile} />
      <ProductSampleRail room={room} vendor={vendor} />
      <LivedInDetails room={room} profile={profile} />

      {profile.features.sampleWall && <SampleWall room={room} />}
      {profile.features.swatchFan && <SwatchFan room={room} profile={profile} />}
      {profile.features.rollRack && <RollRack profile={profile} />}
      {profile.features.palletStack && <PalletStack profile={profile} />}
      {profile.features.bookWall && <BookWall room={room} profile={profile} />}
      {profile.features.pegboard && <Pegboard room={room} />}
      {profile.features.printFrames && <PrintFrames room={room} />}
      {profile.features.cardboardStacks && <CardboardStacks />}
      {profile.features.sideDisplay && <SideDisplay room={room} profile={profile} />}
      {profile.features.ceilingFan && <CeilingFan />}

      {productA && (
        <ProductPaperStack
          position={profile.layout.products[0] as [number, number, number]}
          room={room}
          profile={profile}
          interaction={interactions.first}
          label={productA.name}
        />
      )}

      {productB && (
        <ProductPaperStack
          position={profile.layout.products[1] as [number, number, number]}
          room={room}
          profile={profile}
          interaction={interactions.second}
          label={productB.name}
        />
      )}

      {profile.template === 'scan-lab' && <ScanLab room={room} />}
    </group>
  )
}
