import { useGameStore } from '../store/gameStore'

type SfxName =
  | 'shoot'
  | 'explosion'
  | 'powerup'
  | 'hit'
  | 'boss_hit'
  | 'boss_warn'
  | 'combo'
  | 'levelup'
  | 'bomb'
  | 'menu_select'
  | 'menu_confirm'

class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private buffers: Map<SfxName, AudioBuffer> = new Map()
  private currentMusic: AudioBufferSourceNode | null = null
  private musicPlaying = false
  private initialized = false

  async init(): Promise<void> {
    if (this.initialized) return
    try {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.connect(this.ctx.destination)
      this.masterGain.gain.value = 0.8

      this.musicGain = this.ctx.createGain()
      this.musicGain.connect(this.masterGain)
      this.sfxGain = this.ctx.createGain()
      this.sfxGain.connect(this.masterGain)

      this.initialized = true
    } catch {
      console.warn('Audio not available')
    }
  }

  private ensureContext(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume()
    }
  }

  loadSfx(name: SfxName, base64: string): void {
    if (!this.ctx) return
    const binary = atob(base64.split(',')[1] ?? base64)
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i)
    }
    this.ctx.decodeAudioData(array.buffer, (buf) => {
      this.buffers.set(name, buf)
    })
  }

  playSfx(name: SfxName, volume = 1): void {
    if (!this.ctx || !this.sfxGain) return
    this.ensureContext()
    const buf = this.buffers.get(name)
    if (!buf) return

    const source = this.ctx.createBufferSource()
    source.buffer = buf
    const gain = this.ctx.createGain()
    const settings = useGameStore.getState().settings
    gain.gain.value = volume * settings.sfxVolume
    source.connect(gain)
    gain.connect(this.sfxGain)
    source.start()
  }

  playSfxSynth(name: SfxName): void {
    if (!this.ctx || !this.sfxGain) return
    this.ensureContext()
    const settings = useGameStore.getState().settings
    const vol = settings.sfxVolume

    switch (name) {
      case 'shoot': {
        const osc = this.ctx.createOscillator()
        const g = this.ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(880, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.05)
        g.gain.setValueAtTime(0.1 * vol, this.ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05)
        osc.connect(g)
        g.connect(this.sfxGain)
        osc.start()
        osc.stop(this.ctx.currentTime + 0.05)
        break
      }
      case 'explosion': {
        const bufferSize = this.ctx.sampleRate * 0.3
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
        }
        const source = this.ctx.createBufferSource()
        source.buffer = buffer
        const g = this.ctx.createGain()
        g.gain.setValueAtTime(0.3 * vol, this.ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3)
        source.connect(g)
        g.connect(this.sfxGain)
        source.start()
        break
      }
      case 'powerup': {
        const osc = this.ctx.createOscillator()
        const g = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(523, this.ctx.currentTime)
        osc.frequency.setValueAtTime(659, this.ctx.currentTime + 0.1)
        osc.frequency.setValueAtTime(784, this.ctx.currentTime + 0.2)
        g.gain.setValueAtTime(0.15 * vol, this.ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3)
        osc.connect(g)
        g.connect(this.sfxGain)
        osc.start()
        osc.stop(this.ctx.currentTime + 0.3)
        break
      }
      case 'hit': {
        const osc2 = this.ctx.createOscillator()
        const g2 = this.ctx.createGain()
        osc2.type = 'sawtooth'
        osc2.frequency.setValueAtTime(200, this.ctx.currentTime)
        osc2.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1)
        g2.gain.setValueAtTime(0.1 * vol, this.ctx.currentTime)
        g2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1)
        osc2.connect(g2)
        g2.connect(this.sfxGain)
        osc2.start()
        osc2.stop(this.ctx.currentTime + 0.1)
        break
      }
      case 'boss_hit': {
        for (let i = 0; i < 3; i++) {
          const osc = this.ctx.createOscillator()
          const g = this.ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(150 + i * 30, this.ctx.currentTime + i * 0.05)
          g.gain.setValueAtTime(0.08 * vol, this.ctx.currentTime + i * 0.05)
          g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.08)
          osc.connect(g)
          g.connect(this.sfxGain)
          osc.start(this.ctx.currentTime + i * 0.05)
          osc.stop(this.ctx.currentTime + i * 0.05 + 0.08)
        }
        break
      }
      case 'bomb': {
        const osc3 = this.ctx.createOscillator()
        const g3 = this.ctx.createGain()
        osc3.type = 'sine'
        osc3.frequency.setValueAtTime(200, this.ctx.currentTime)
        osc3.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5)
        g3.gain.setValueAtTime(0.2 * vol, this.ctx.currentTime)
        g3.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5)
        osc3.connect(g3)
        g3.connect(this.sfxGain)
        osc3.start()
        osc3.stop(this.ctx.currentTime + 0.5)

        const noise = this.ctx.createBufferSource()
        const nb = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate)
        const nd = nb.getChannelData(0)
        for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nd.length)
        noise.buffer = nb
        const gn = this.ctx.createGain()
        gn.gain.setValueAtTime(0.2 * vol, this.ctx.currentTime)
        gn.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5)
        noise.connect(gn)
        gn.connect(this.sfxGain)
        noise.start()
        noise.stop(this.ctx.currentTime + 0.5)
        break
      }
      case 'combo': {
        const osc4 = this.ctx.createOscillator()
        const g4 = this.ctx.createGain()
        osc4.type = 'sine'
        osc4.frequency.setValueAtTime(784, this.ctx.currentTime)
        osc4.frequency.setValueAtTime(988, this.ctx.currentTime + 0.08)
        g4.gain.setValueAtTime(0.12 * vol, this.ctx.currentTime)
        g4.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2)
        osc4.connect(g4)
        g4.connect(this.sfxGain)
        osc4.start()
        osc4.stop(this.ctx.currentTime + 0.2)
        break
      }
      case 'levelup': {
        const notes = [523, 659, 784, 1047]
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator()
          const g = this.ctx!.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.12)
          g.gain.setValueAtTime(0.12 * vol, this.ctx!.currentTime + i * 0.12)
          g.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.12 + 0.15)
          osc.connect(g)
          g.connect(this.sfxGain!)
          osc.start(this.ctx!.currentTime + i * 0.12)
          osc.stop(this.ctx!.currentTime + i * 0.12 + 0.15)
        })
        break
      }
      case 'menu_select': {
        const osc5 = this.ctx.createOscillator()
        const g5 = this.ctx.createGain()
        osc5.type = 'sine'
        osc5.frequency.setValueAtTime(440, this.ctx.currentTime)
        osc5.frequency.setValueAtTime(554, this.ctx.currentTime + 0.03)
        g5.gain.setValueAtTime(0.08 * vol, this.ctx.currentTime)
        g5.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1)
        osc5.connect(g5)
        g5.connect(this.sfxGain)
        osc5.start()
        osc5.stop(this.ctx.currentTime + 0.1)
        break
      }
      case 'menu_confirm': {
        const osc6 = this.ctx.createOscillator()
        const g6 = this.ctx.createGain()
        osc6.type = 'sine'
        osc6.frequency.setValueAtTime(392, this.ctx.currentTime)
        osc6.frequency.setValueAtTime(523, this.ctx.currentTime + 0.05)
        osc6.frequency.setValueAtTime(659, this.ctx.currentTime + 0.1)
        g6.gain.setValueAtTime(0.1 * vol, this.ctx.currentTime)
        g6.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2)
        osc6.connect(g6)
        g6.connect(this.sfxGain)
        osc6.start()
        osc6.stop(this.ctx.currentTime + 0.2)
        break
      }
      default: {
        const osc = this.ctx.createOscillator()
        const g = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, this.ctx.currentTime)
        g.gain.setValueAtTime(0.1 * vol, this.ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1)
        osc.connect(g)
        g.connect(this.sfxGain)
        osc.start()
        osc.stop(this.ctx.currentTime + 0.1)
      }
    }
  }

  startMusic(): void {
    if (!this.ctx || !this.musicGain || this.musicPlaying) return
    this.ensureContext()
  }

  stopMusic(): void {
    if (this.currentMusic) {
      try { this.currentMusic.stop() } catch {}
      this.currentMusic = null
    }
    this.musicPlaying = false
  }

  setMusicVolume(v: number): void {
    if (this.musicGain) this.musicGain.gain.value = v
  }

  setSfxVolume(v: number): void {
    if (this.sfxGain) this.sfxGain.gain.value = v
  }

  dispose(): void {
    this.stopMusic()
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
    this.initialized = false
  }
}

export const audioManager = new AudioManager()
