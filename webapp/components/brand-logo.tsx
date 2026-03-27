export function BrandLogo() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 120 120" role="img">
        <defs>
          <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8a35ff" />
            <stop offset="100%" stopColor="#28d7d8" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="62" r="41" fill="#ffffff" stroke="url(#brandGradient)" strokeWidth="10" />
        <circle cx="43" cy="57" r="7" fill="#253167" />
        <circle cx="77" cy="57" r="7" fill="#253167" />
        <path
          d="M45 78c10 9 20 9 30 0"
          fill="none"
          stroke="#253167"
          strokeLinecap="round"
          strokeWidth="6"
        />
        <circle cx="33" cy="61" r="13" fill="none" stroke="url(#brandGradient)" strokeWidth="8" />
        <circle cx="87" cy="61" r="13" fill="none" stroke="url(#brandGradient)" strokeWidth="8" />
        <path
          d="M52 17c5-9 14-13 22-11"
          fill="none"
          stroke="#4c2aa8"
          strokeLinecap="round"
          strokeWidth="7"
        />
        <circle cx="77" cy="11" r="10" fill="#28d7d8" />
        <path
          d="M24 96c13 14 56 19 77-1"
          fill="none"
          stroke="url(#brandGradient)"
          strokeLinecap="round"
          strokeWidth="11"
        />
        <path d="M87 23h21c8 0 12 5 12 11v12c0 7-4 11-12 11H96l-9 10v-10" fill="url(#brandGradient)" />
        <circle cx="98" cy="40" r="4.5" fill="#ffffff" />
        <circle cx="109" cy="40" r="4.5" fill="#ffffff" />
        <circle cx="120" cy="40" r="4.5" fill="#ffffff" />
      </svg>
    </span>
  );
}
