import { getMediaUrl, getPresetAvatar } from '../api/client'

export function UserAvatar({
  avatarUrl,
  fallback,
  className = '',
  size = 38,
  isOnline,
}: {
  avatarUrl?: string | null
  fallback: string
  className?: string
  size?: number
  isOnline?: boolean
}) {
  const preset = getPresetAvatar(avatarUrl)

  const content = (() => {
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
            borderRadius: '50%',
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
          alt={fallback}
          className={`avatar-img-round ${className}`}
          style={{
            width: size,
            height: size,
            minWidth: size,
            minHeight: size,
            objectFit: 'cover',
            borderRadius: '50%',
            flex: 'none',
            display: 'block',
            aspectRatio: '1/1',
          }}
        />
      )
    }

    return (
      <span
        className={`avatar-fallback-round ${className}`}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius: '50%',
          display: 'inline-grid',
          placeItems: 'center',
          flex: 'none',
          fontSize: size * 0.44,
          fontWeight: 700,
          background: '#e3ece4',
          color: '#32583d',
        }}
      >
        {(fallback.slice(0, 1) || 'U').toUpperCase()}
      </span>
    )
  })()

  if (isOnline !== undefined) {
    return (
      <span
        className="avatar-with-badge"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          position: 'relative',
          display: 'inline-flex',
          flex: 'none',
        }}
      >
        {content}
        {isOnline && <span className="avatar-online-dot" title="Active now" />}
      </span>
    )
  }

  return content
}
