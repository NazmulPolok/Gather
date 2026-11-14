import { getMediaUrl, getPresetAvatar } from '../api/client'

export function GroupAvatar({
  avatarUrl,
  name,
  className = '',
  size = 38,
}: {
  avatarUrl?: string | null
  name: string
  className?: string
  size?: number
}) {
  const preset = getPresetAvatar(avatarUrl)

  if (preset) {
    return (
      <span
        className={`avatar-preset-icon ${className}`}
        style={{
          backgroundColor: preset.bg,
          color: preset.color,
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          fontSize: size * 0.52,
          flex: 'none',
          borderRadius: Math.round(size * 0.28),
          display: 'inline-grid',
          placeItems: 'center',
        }}
        title={preset.label}
      >
        {preset.emoji}
      </span>
    )
  }

  if (avatarUrl) {
    return (
      <img
        src={getMediaUrl(avatarUrl)}
        alt={name}
        className={`group-avatar-img ${className}`}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          objectFit: 'cover',
          borderRadius: Math.round(size * 0.28),
          flex: 'none',
          display: 'block',
          aspectRatio: '1/1',
        }}
      />
    )
  }

  return (
    <span
      className={`group-avatar-fallback ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: Math.round(size * 0.28),
        display: 'inline-grid',
        placeItems: 'center',
        flex: 'none',
        fontSize: size * 0.44,
        fontWeight: 700,
        background: '#e0eee1',
        color: '#346d46',
      }}
    >
      {(name.slice(0, 1) || 'G').toUpperCase()}
    </span>
  )
}
