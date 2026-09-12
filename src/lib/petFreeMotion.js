export const FREE_MARGIN = 24
export const FREE_TOP_MARGIN = 92

export function freeBounds(viewport, pet, margin = FREE_MARGIN) {
  const minX = margin
  const minY = FREE_TOP_MARGIN
  const maxX = Math.max(minX, viewport.width - pet.width - margin)
  const maxY = Math.max(minY, viewport.height - pet.height - margin)

  return { minX, maxX, minY, maxY }
}

export function clampFreePosition(position, bounds) {
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, position.x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, position.y)),
  }
}

export function advanceFreeFall(position, dt, gravity = 2600) {
  if (position.landed) return { ...position, y: position.groundY, vy: 0, landed: true }

  const nextVy = position.vy + gravity * dt
  const nextY = position.y + position.vy * dt + 0.5 * gravity * dt * dt
  if (nextY >= position.groundY) {
    return { ...position, y: position.groundY, vy: 0, landed: true }
  }

  return { ...position, y: nextY, vy: nextVy, landed: false }
}

export function advanceFreeWalk(position, dt) {
  const nextX = position.x + position.direction * position.speed * dt
  if (nextX >= position.bounds.maxX) {
    return { ...position, x: position.bounds.maxX, direction: -1 }
  }
  if (nextX <= position.bounds.minX) {
    return { ...position, x: position.bounds.minX, direction: 1 }
  }
  return { ...position, x: nextX }
}

export function randomFreeTarget(bounds, random = Math.random) {
  return {
    x: bounds.minX + random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + random() * (bounds.maxY - bounds.minY),
  }
}

export function advanceFreePosition(position, dt) {
  const dx = position.targetX - position.x
  const dy = position.targetY - position.y
  const distance = Math.hypot(dx, dy)
  const step = Math.min(distance, Math.max(0, position.speed * dt))

  if (distance === 0 || step === 0) {
    return { ...position, arrived: distance === 0 }
  }

  const arrived = step >= distance
  return {
    ...position,
    x: arrived ? position.targetX : position.x + (dx / distance) * step,
    y: arrived ? position.targetY : position.y + (dy / distance) * step,
    arrived,
  }
}
