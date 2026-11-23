interface DjoumaLogoProps {
  size?: number;
  className?: string;
}

export function DjoumaLogo({ size = 36, className = '' }: DjoumaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="#0F172A" />
      <rect
        x="14"
        y="14"
        width="24"
        height="24"
        rx="6"
        stroke="#94A3B8"
        strokeWidth="3"
      />
      <rect
        x="26"
        y="26"
        width="24"
        height="24"
        rx="6"
        fill="#0D9488"
        stroke="#CCFBF1"
        strokeWidth="2.5"
      />
      <path
        d="M34 38H42M38 34V42"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
