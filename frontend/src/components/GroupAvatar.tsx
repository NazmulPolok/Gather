import { getMediaUrl, getPresetAvatar } from '../api/client'

export function GroupAvatar({
  avatarUrl,
  name,
  className = '',
  size,
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
        alt={name}
        className={`group-avatar-img ${className}`}
        style={size ? { width: size, height: size } : undefined}
      />
    )
  }

  return <span>{(name.slice(0, 1) || 'G').toUpperCase()}</span>
}
