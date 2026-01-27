export function WellsFargoLogo({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { container: "h-6", text: "text-lg", tagline: "text-[8px]" },
    default: { container: "h-8", text: "text-xl", tagline: "text-[10px]" },
    large: { container: "h-10", text: "text-2xl", tagline: "text-xs" },
  };
  
  const s = sizes[size];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${s.container} aspect-square relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
          <circle cx="50" cy="50" r="48" fill="#ffcd41" />
          <g fill="#cd1409">
            <rect x="20" y="45" width="60" height="20" rx="2" />
            <rect x="25" y="40" width="50" height="8" rx="1" />
            <circle cx="30" cy="70" r="8" />
            <circle cx="70" cy="70" r="8" />
            <circle cx="30" cy="70" r="4" fill="#ffcd41" />
            <circle cx="70" cy="70" r="4" fill="#ffcd41" />
            <rect x="78" y="42" width="8" height="3" />
            <rect x="82" y="35" width="3" height="10" />
            <rect x="40" y="48" width="20" height="10" rx="1" fill="#ffcd41" />
          </g>
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span 
          className={`text-white ${s.text} tracking-[0.02em]`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          WELLS FARGO
        </span>
      </div>
    </div>
  );
}

export function WellsFargoIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="#ffcd41" />
      <g fill="#cd1409">
        <rect x="20" y="45" width="60" height="20" rx="2" />
        <rect x="25" y="40" width="50" height="8" rx="1" />
        <circle cx="30" cy="70" r="8" />
        <circle cx="70" cy="70" r="8" />
        <circle cx="30" cy="70" r="4" fill="#ffcd41" />
        <circle cx="70" cy="70" r="4" fill="#ffcd41" />
        <rect x="78" y="42" width="8" height="3" />
        <rect x="82" y="35" width="3" height="10" />
        <rect x="40" y="48" width="20" height="10" rx="1" fill="#ffcd41" />
      </g>
    </svg>
  );
}
