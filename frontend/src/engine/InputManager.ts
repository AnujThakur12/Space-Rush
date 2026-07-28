import type { InputState } from '../types/game'
import { useGameStore } from '../store/gameStore'

class InputManager {
  state: InputState = {
    touchX: 0,
    touchY: 0,
    touchActive: false,
    firing: false,
    bombPressed: false,
    pausePressed: false,
    keys: new Set(),
    joystickAngle: 0,
    joystickMagnitude: 0,
    mouseX: 0,
    mouseY: 0,
    mouseActive: false,
  }

  private canvas: HTMLCanvasElement | null = null
  private touchIdentifier: number | null = null
  private joystickCenterX = 0
  private joystickCenterY = 0
  private joystickActive = false
  private onPause?: () => void
  private keysDown: Record<string, boolean> = {}
  private mouseOnCanvas = false
  private mouseInside = false

  init(canvas: HTMLCanvasElement, onPause?: () => void): void {
    this.canvas = canvas
    this.onPause = onPause

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)

    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false })
    canvas.addEventListener('touchend', this.onTouchEnd, { passive: false })
    canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false })

    canvas.addEventListener('mousedown', this.onMouseDown)
    canvas.addEventListener('mousemove', this.onMouseMove)
    canvas.addEventListener('mouseup', this.onMouseUp)
    canvas.addEventListener('mouseenter', () => { this.mouseInside = true })
    canvas.addEventListener('mouseleave', () => { this.mouseInside = false })

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.state.keys.clear()
        this.state.firing = false
        this.state.touchActive = false
        this.joystickActive = false
        this.mouseOnCanvas = false
      }
    })
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.repeat) return
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      this.onPause?.()
      return
    }
    if (e.key === ' ' || e.key === 'z' || e.key === 'Z') {
      this.state.firing = true
    }
    if (e.key === 'x' || e.key === 'X') {
      this.state.bombPressed = true
    }
    this.state.keys.add(e.key)
    this.keysDown[e.key] = true
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.key === ' ' || e.key === 'z' || e.key === 'Z') {
      if (!this.mouseOnCanvas) this.state.firing = false
    }
    if (e.key === 'x' || e.key === 'X') {
      // handled on read
    }
    this.state.keys.delete(e.key)
    this.keysDown[e.key] = false
  }

  private getTouchPos(e: TouchEvent): { x: number; y: number } | null {
    const t = this.touchIdentifier !== null
      ? Array.from(e.changedTouches).find((tch) => tch.identifier === this.touchIdentifier)
      : e.changedTouches[0]
    if (!t || !this.canvas) return null
    const rect = this.canvas.getBoundingClientRect()
    const x = ((t.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((t.clientY - rect.top) / rect.height) * 2 + 1
    return { x, y }
  }

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault()
    const settings = useGameStore.getState().settings
    if (this.touchIdentifier === null && e.changedTouches.length > 0) {
      const t = e.changedTouches[0]
      this.touchIdentifier = t.identifier
      this.joystickCenterX = t.clientX
      this.joystickCenterY = t.clientY
      this.joystickActive = true
      this.state.firing = settings.autoFire
    }
  }

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault()
    if (this.touchIdentifier === null) return
    const t = Array.from(e.changedTouches).find(
      (tch) => tch.identifier === this.touchIdentifier
    )
    if (!t) return

    const dx = t.clientX - this.joystickCenterX
    const dy = t.clientY - this.joystickCenterY
    const maxDist = 100
    const mag = Math.min(Math.sqrt(dx * dx + dy * dy) / maxDist, 1)
    const angle = Math.atan2(dy, dx)

    const settings = useGameStore.getState().settings
    const sens = settings.joystickSensitivity

    this.state.joystickAngle = angle
    this.state.joystickMagnitude = Math.min(mag * sens, 1)

    const pos = this.getTouchPos(e)
    if (pos) {
      this.state.touchX = pos.x * (this.state.joystickMagnitude)
      this.state.touchY = pos.y * (this.state.joystickMagnitude)
    }
    this.state.touchActive = true
  }

  private onTouchEnd = (e: TouchEvent): void => {
    e.preventDefault()
    const t = Array.from(e.changedTouches).find(
      (tch) => tch.identifier === this.touchIdentifier
    )
    if (!t) return

    this.touchIdentifier = null
    this.joystickActive = false
    this.state.touchActive = false
    this.state.touchX = 0
    this.state.touchY = 0
    this.state.joystickAngle = 0
    this.state.joystickMagnitude = 0
    const settings = useGameStore.getState().settings
    this.state.firing = !settings.autoFire && false
  }

  private onMouseDown = (e: MouseEvent): void => {
    e.preventDefault()
    this.mouseOnCanvas = true
    this.state.firing = true
    this.state.mouseActive = true
    this.updateMousePos(e)
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.state.mouseActive = true
    this.updateMousePos(e)
  }

  private onMouseUp = (): void => {
    this.mouseOnCanvas = false
    this.state.firing = false
    this.state.mouseActive = false
  }

  private updateMousePos(e: MouseEvent): void {
    if (!this.canvas) return
    const rect = this.canvas.getBoundingClientRect()
    this.state.mouseX = e.clientX - rect.left
    this.state.mouseY = e.clientY - rect.top
  }

  readBomb(): boolean {
    if (this.state.bombPressed) {
      this.state.bombPressed = false
      return true
    }
    return false
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this.onTouchStart)
      this.canvas.removeEventListener('touchmove', this.onTouchMove)
      this.canvas.removeEventListener('touchend', this.onTouchEnd)
      this.canvas.removeEventListener('touchcancel', this.onTouchEnd)
      this.canvas.removeEventListener('mousedown', this.onMouseDown)
      this.canvas.removeEventListener('mousemove', this.onMouseMove)
      this.canvas.removeEventListener('mouseup', this.onMouseUp)
    }
  }
}

export const inputManager = new InputManager()
