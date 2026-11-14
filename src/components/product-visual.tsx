import Image from "next/image";

type Props = {
  name: string;
  categorySlug: string;
  brand: string;
  image?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function hashHue(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) % 360;
  // Keep the palette within the indigo → cyan band for a consistent look.
  return 200 + (hash % 70);
}

function DeviceShape({ kind, hue }: { kind: string; hue: number }) {
  const device = `hsl(${hue} 35% 22%)`;
  const deviceLight = `hsl(${hue} 30% 34%)`;
  const screenTop = `hsl(${hue} 85% 62%)`;
  const screenBottom = `hsl(${hue + 35} 80% 52%)`;
  const metal = `hsl(${hue} 15% 78%)`;

  switch (kind) {
    case "audio":
      return (
        <g>
          <rect x="118" y="150" width="164" height="132" rx="34" fill={device} />
          <rect x="130" y="162" width="140" height="108" rx="26" fill={deviceLight} opacity="0.5" />
          <circle cx="162" cy="216" r="22" fill={metal} />
          <circle cx="238" cy="216" r="22" fill={metal} />
          <circle cx="162" cy="216" r="9" fill={device} />
          <circle cx="238" cy="216" r="9" fill={device} />
          <rect x="190" y="150" width="20" height="8" rx="4" fill={screenTop} />
        </g>
      );
    case "charging":
      return (
        <g>
          <path d="M150 96 h100 a20 20 0 0 1 20 20 v70 a20 20 0 0 1 -20 20 h-100 a20 20 0 0 1 -20 -20 v-70 a20 20 0 0 1 20 -20 z" fill={device} />
          <rect x="146" y="112" width="108" height="16" rx="8" fill={deviceLight} />
          <path d="M170 206 v34 a28 28 0 0 0 28 28 h44 a28 28 0 0 1 28 28 v24" fill="none" stroke={deviceLight} strokeWidth="12" strokeLinecap="round" />
          <rect x="248" y="238" width="26" height="18" rx="4" fill={screenTop} />
          <rect x="158" y="84" width="10" height="22" rx="4" fill={metal} />
          <rect x="232" y="84" width="10" height="22" rx="4" fill={metal} />
        </g>
      );
    case "power-banks":
      return (
        <g>
          <rect x="128" y="120" width="144" height="176" rx="26" fill={device} />
          <rect x="146" y="146" width="108" height="60" rx="14" fill={deviceLight} opacity="0.55" />
          <circle cx="160" cy="258" r="8" fill={screenTop} />
          <circle cx="186" cy="258" r="8" fill={screenTop} />
          <circle cx="212" cy="258" r="8" fill={screenLight(hue)} />
          <circle cx="238" cy="258" r="8" fill={screenLight(hue)} />
          <rect x="146" y="276" width="46" height="10" rx="5" fill={metal} />
          <rect x="204" y="276" width="46" height="10" rx="5" fill={metal} />
        </g>
      );
    case "covers":
      return (
        <g>
          <rect x="142" y="58" width="116" height="284" rx="30" fill={device} />
          <rect x="156" y="72" width="88" height="256" rx="20" fill="none" stroke={deviceLight} strokeWidth="8" />
          <rect x="182" y="58" width="48" height="34" rx="16" fill={deviceLight} />
          <circle cx="198" cy="75" r="9" fill="#0b1220" />
          <circle cx="216" cy="75" r="9" fill="#0b1220" />
        </g>
      );
    case "screen-protectors":
      return (
        <g>
          <rect x="150" y="66" width="100" height="268" rx="20" fill={deviceLight} opacity="0.35" />
          <rect x="138" y="60" width="124" height="280" rx="24" fill={screenTop} opacity="0.28" stroke={metal} strokeWidth="3" />
          <path d="M160 300 L240 88" stroke="#ffffff" strokeWidth="16" opacity="0.55" strokeLinecap="round" />
          <path d="M186 308 L258 112" stroke="#ffffff" strokeWidth="8" opacity="0.4" strokeLinecap="round" />
        </g>
      );
    case "smart-watches":
      return (
        <g>
          <rect x="168" y="52" width="64" height="70" rx="24" fill={deviceLight} opacity="0.7" />
          <rect x="168" y="278" width="64" height="70" rx="24" fill={deviceLight} opacity="0.7" />
          <rect x="150" y="118" width="100" height="164" rx="28" fill={device} />
          <rect x="162" y="130" width="76" height="140" rx="20" fill={screenTop} />
          <rect x="250" y="182" width="14" height="26" rx="6" fill={metal} />
        </g>
      );
    case "speakers":
      return (
        <g>
          <rect x="120" y="128" width="160" height="160" rx="40" fill={device} />
          <circle cx="200" cy="208" r="46" fill={deviceLight} />
          <circle cx="200" cy="208" r="26" fill={screenBottom} opacity="0.85" />
          <circle cx="200" cy="208" r="9" fill={device} />
          <rect x="150" y="150" width="100" height="8" rx="4" fill={metal} opacity="0.6" />
        </g>
      );
    default:
      return (
        <g>
          <rect x="140" y="58" width="120" height="284" rx="26" fill={device} />
          <rect x="150" y="72" width="100" height="256" rx="18" fill={screenTop} />
          <rect x="150" y="72" width="100" height="256" rx="18" fill="url(#screen)" />
          <rect x="186" y="64" width="28" height="9" rx="4.5" fill="#0b1220" />
          <rect x="164" y="88" width="52" height="46" rx="12" fill="#0b1220" opacity="0.55" />
          <circle cx="180" cy="104" r="9" fill={deviceLight} />
          <circle cx="202" cy="104" r="9" fill={deviceLight} />
          <circle cx="180" cy="122" r="6" fill={deviceLight} opacity="0.7" />
        </g>
      );
  }
}

function screenLight(hue: number) {
  return `hsl(${hue} 25% 42%)`;
}

export function ProductIllustration({
  name,
  categorySlug,
  className = "",
}: {
  name: string;
  categorySlug: string;
  className?: string;
}) {
  const hue = hashHue(name);
  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={`${name} product illustration`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 90% 97%)`} />
          <stop offset="100%" stopColor={`hsl(${hue + 40} 85% 92%)`} />
        </linearGradient>
        <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 85% 62%)`} stopOpacity="0.55" />
          <stop offset="100%" stopColor={`hsl(${hue + 40} 80% 48%)`} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#bg)" />
      <DeviceShape kind={categorySlug} hue={hue} />
    </svg>
  );
}

export function ProductVisual({
  name,
  categorySlug,
  brand,
  image,
  className = "",
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
}: Props) {
  const src = image?.trim();
  const isRemote = !!src && /^https?:\/\//i.test(src);

  if (isRemote) {
    return (
      <div className={`relative overflow-hidden bg-surface-muted ${className}`}>
        <Image
          src={src}
          alt={`${name} by ${brand}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  if (src && src.startsWith("/")) {
    return (
      <div className={`relative overflow-hidden bg-surface-muted ${className}`}>
        <Image
          src={src}
          alt={`${name} by ${brand}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-surface-muted ${className}`}>
      <ProductIllustration name={name} categorySlug={categorySlug} className="h-full w-full" />
    </div>
  );
}
