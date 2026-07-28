import { useGameStore } from '../store/gameStore'

export function Notifications() {
  const notifications = useGameStore((s) => s.notifications)

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 8, pointerEvents: 'none', zIndex: 20,
    }}>
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            color: n.color,
            fontSize: 20,
            fontWeight: 700,
            textShadow: '0 0 20px currentColor',
            animation: 'fadeInUp 0.3s ease-out',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}
        >
          {n.text}
        </div>
      ))}
    </div>
  )
}
