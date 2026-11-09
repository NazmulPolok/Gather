import { getMediaUrl, getPresetAvatar } from '../api/client'

export function UserAvatar({
  avatarUrl,
  fallback,
  className = '',
  size,
}: {
  avatarUrl?: string | null
  fallback: string
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
