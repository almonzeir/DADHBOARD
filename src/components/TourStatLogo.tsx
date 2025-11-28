interface TourStatLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
  showText?: boolean;
  tagline?: 'intelligence' | 'decisions';
}

export default function TourStatLogo({ 
  size = 'md', 
  variant = 'default', 
  showText = true,
  tagline = 'intelligence' 
}: TourStatLogoProps) {
  const dimensions = {
    sm: { icon: 32, text: 'text-base', tagline: 'text-xs' },
    md: { icon: 40, text: 'text-lg', tagline: 'text-xs' },
    lg: { icon: 48, text: 'text-2xl', tagline: 'text-sm' }
  };

  const colors = variant === 'white' 
    ? { 
        fill: '#ffffff',
        text: 'text-white', 
        tagline: 'text-white/80' 
      }
    : { 
        fill: '#22c55e', // green-500 matching your theme
        text: 'text-neutral-900', 
        tagline: 'text-neutral-600' 
      };

  const taglineText = tagline === 'decisions' ? 'Smarter Tourism Decisions' : 'Tourism Intelligence';
  const iconSize = dimensions[size].icon;
  
  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon - Exact recreation from your image */}
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Four circles in 2x2 grid */}
        <circle cx="16" cy="16" r="5" fill={colors.fill} />
        <circle cx="32" cy="16" r="5" fill={colors.fill} />
        <circle cx="16" cy="32" r="5" fill={colors.fill} />
        <circle cx="32" cy="32" r="5" fill={colors.fill} />
        
        {/* Connecting curves between circles */}
        {/* Top horizontal connection */}
        <path 
          d="M 21 16 Q 24 14 27 16" 
          stroke={colors.fill} 
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Bottom horizontal connection */}
        <path 
          d="M 21 32 Q 24 34 27 32" 
          stroke={colors.fill} 
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Left vertical connection */}
        <path 
          d="M 16 21 Q 14 24 16 27" 
          stroke={colors.fill} 
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Right vertical connection */}
        <path 
          d="M 32 21 Q 34 24 32 27" 
          stroke={colors.fill} 
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Text */}
      {showText && (
        <div>
          <h1 className={`${dimensions[size].text} ${colors.text} tracking-tight`}>
            TourStat
          </h1>
          <p className={`${dimensions[size].tagline} ${colors.tagline}`}>
            {taglineText}
          </p>
        </div>
      )}
    </div>
  );
}
