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
    aimX: 0,
    aimY: 0,
    aimAngle: -Math.PI / 2,
  }

  private canvas: HTMLCanvasElement | null = null

  private onPause?: () => void
  private mouseOnCanvas = false
  private prevTouchCount = 0

  private gamepadIndex: number | null = null
  private gamepadInterval: ReturnType<typeof setInterval> | null = null

  init(canvas: HTMLCanvasElement, onPause?: () => void): void {
    this.canvas = canvas
    this.onPause = onPause

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (!isTouchDevice) {
      canvas.addEventListener('touchstart', this.onTouchStart, { passive: false })
      canvas.addEventListener('touchmove', this.onTouchMove, { passive: false })
      canvas.addEventListener('touchend', this.onTouchEnd, { passive: false })
      canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false })
    }

    canvas.addEventListener('mousedown', this.onMouseDown)
    canvas.addEventListener('mousemove', this.onMouseMove)
    canvas.addEventListener('mouseup', this.onMouseUp)
    canvas.addEventListener('mouseenter', () => { this.mouseOnCanvas = true })
    canvas.addEventListener('mouseleave', () => { this.mouseOnCanvas = false })

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.state.keys.clear()
        if (!this.state.touchActive) this.state.firing = false
        this.state.mouseActive = false
        this.mouseOnCanvas = false
      }
    })

    this.startGamepadPolling()
  }

  private startGamepadPolling(): void {
    if (this.gamepadInterval) return
    this.gamepadInterval = setInterval(() => {
      const gamepads = navigator.getGamepads?.()
      if (!gamepads) return
      for (const gp of gamepads) {
        if (!gp) continue
        this.gamepadIndex = gp.index
        this.processGamepad(gp)
        break
      }
    }, 50)
  }

  private processGamepad(gp: Gamepad): void {
    const DEADZONE = 0.2
    let lx = gp.axes[0] || 0
    let ly = gp.axes[1] || 0
    if (Math.abs(lx) < DEADZONE) lx = 0
    if (Math.abs(ly) < DEADZONE) ly = 0

    const gpState = useGameStore.getState()
    const settings = gpState.settings
    const screen = gpState.screen
    const isPlaying = screen === 'playing'

    if (isPlaying) {
      this.state.firing = settings.autoFire ||
        gp.buttons[0]?.pressed ||
        gp.buttons[5]?.pressed ||
        gp.buttons[7]?.pressed
    }

    if (gp.buttons[2]?.pressed || gp.buttons[1]?.pressed) {
      this.state.bombPressed = true
    }

    if (gp.buttons[9]?.pressed || gp.buttons[8]?.pressed) {
      this.onPause?.()
    }
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
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    const settings = useGameStore.getState().settings
    if (e.key === ' ' || e.key === 'z' || e.key === 'Z') {
      if (!settings.autoFire && !this.mouseOnCanvas) {
        this.state.firing = false
      }
    }
    this.state.keys.delete(e.key)
  }

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault()
    const settings = useGameStore.getState().settings

    if (e.touches.length === 0) return
    this.state.touchActive = true
    this.state.firing = settings.autoFire
    this.prevTouchCount = e.touches.length
  }

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault()
    if (!this.canvas) return

    const rect = this.canvas.getBoundingClientRect()

    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i]

      if (i === 0) {
        const canvasX = (t.clientX - rect.left)
        const canvasY = (t.clientY - rect.top)
        const normX = (canvasX / rect.width) * 2 - 1
        const normY = -((canvasY / rect.height) * 2 - 1)

        this.state.touchX = normX
        this.state.touchY = normY
      }
    }

    this.state.touchActive = true
  }

  private onTouchEnd = (e: TouchEvent): void => {
    e.preventDefault()
    if (e.touches.length === 0) {
      this.state.touchActive = false
      this.state.touchX = 0
      this.state.touchY = 0
      this.state.joystickAngle = 0
      this.state.joystickMagnitude = 0
    }
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
    const settings = useGameStore.getState().settings
    if (!settings.autoFire) {
      this.state.firing = false
    }
  }

  private updateMousePos(e: MouseEvent): void {
    if (!this.canvas) return
    const rect = this.canvas.getBoundingClientRect()
    this.state.mouseX = e.clientX - rect.left
    this.state.mouseY = e.clientY - rect.top
  }

  updateAim(playerX: number, playerY: number): void {
    if (this.state.mouseActive) {
      this.state.aimX = this.state.mouseX
      this.state.aimY = this.state.mouseY
    } else {
      this.state.aimX = playerX
      this.state.aimY = playerY - 100
    }
    const dx = this.state.aimX - playerX
    const dy = this.state.aimY - playerY
    this.state.aimAngle = Math.atan2(dy, dx)
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
    if (this.gamepadInterval) {
      clearInterval(this.gamepadInterval)
      this.gamepadInterval = null
    }
  }
}

export const inputManager = new InputManager()
