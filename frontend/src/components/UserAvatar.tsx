import { getMediaUrl, getPresetAvatar } from '../api/client'

export function UserAvatar({
  avatarUrl,
  fallback,
  className = '',
  size,
  isOnline,
}: {
  avatarUrl?: string | null
  fallback: string
  className?: string
  size?: number
  isOnline?: boolean
}) {
  const preset = getPresetAvatar(avatarUrl)

  const renderAvatarContent = () => {
    if (preset) {
      return (
        <span
          className={`avatar-preset-icon ${className}`}
          style={{
            backgroundColor: preset.bg,
            color: preset.color,
            ...(size ? { width: size, height: size, fontSize: size * 0.52 } : {}),
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
          style={size ? { width: size, height: size } : undefined}
        />
      )
    }

    return <span>{(fallback.slice(0, 1) || 'U').toUpperCase()}</span>
  }

  if (isOnline !== undefined) {
    return (
      <span className="avatar-with-badge" style={size ? { width: size, height: size } : undefined}>
        {renderAvatarContent()}
        {isOnline && <span className="avatar-online-dot" title="Active now" />}
      </span>
    )
  }

  return renderAvatarContent()
}
