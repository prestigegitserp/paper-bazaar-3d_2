type MobileInputState = {
  moveX: number
  moveY: number
  lookX: number
  lookY: number
  interactSequence: number
  zoomDelta: number
}

const state: MobileInputState = {
  moveX: 0,
  moveY: 0,
  lookX: 0,
  lookY: 0,
  interactSequence: 0,
  zoomDelta: 0
}

export function setMobileMove(x: number, y: number) {
  state.moveX = Math.max(-1, Math.min(1, x))
  state.moveY = Math.max(-1, Math.min(1, y))
}

export function getMobileMove() {
  return { x: state.moveX, y: state.moveY }
}

export function addMobileLook(x: number, y: number) {
  state.lookX += x
  state.lookY += y
}

export function consumeMobileLook() {
  const value = { x: state.lookX, y: state.lookY }
  state.lookX = 0
  state.lookY = 0
  return value
}

export function triggerMobileInteract() {
  state.interactSequence += 1
}

export function getMobileInteractSequence() {
  return state.interactSequence
}

export function addMobileZoom(delta: number) {
  state.zoomDelta += delta
}

export function consumeMobileZoom() {
  const value = state.zoomDelta
  state.zoomDelta = 0
  return value
}

export function resetMobileInput() {
  state.moveX = 0
  state.moveY = 0
  state.lookX = 0
  state.lookY = 0
  state.zoomDelta = 0
}
