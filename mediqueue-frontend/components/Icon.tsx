/**
 * components/Icon.tsx
 *
 * One shared SVG sprite (<IconSprite/>, mounted once in the root layout)
 * plus a small <Icon/> component that references it with <use>. Keeps
 * every icon on the site visually identical without repeating SVG path
 * data on every page.
 */

const PATHS: Record<string, string> = {
  search: '<circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
  stethoscope: '<path d="M4.8 2.3a.7.7 0 1 0-1.2.7l.9.8a1 1 0 0 1 .3.7v4.4a5.5 5.5 0 0 0 11 0V4.5a1 1 0 0 1 .3-.7l.9-.8a.7.7 0 1 0-1.2-.7l-.9.8a2.5 2.5 0 0 0-.8 1.8v4.5a3.5 3.5 0 1 1-7 0V4.5a2.5 2.5 0 0 0-.8-1.8z"></path><path d="M15.8 12.5a6.5 6.5 0 0 1-13 0v-1"></path><circle cx="20" cy="16" r="2"></circle><path d="M15.8 13v1a4.2 4.2 0 0 0 4.2 4.2"></path>',
  baby: '<circle cx="12" cy="8" r="4"></circle><path d="M9 14c-3 1-4 3-4 6h14c0-3-1-5-4-6"></path><path d="M9.5 8.5c.5.8 1.4 1 2.5 1s2-.2 2.5-1"></path>',
  heartPulse: '<path d="M20 8.5c0-2.5-2-4.5-4.5-4.5-1.5 0-2.8.7-3.5 1.8-.7-1.1-2-1.8-3.5-1.8C6 4 4 6 4 8.5c0 4 4.5 7.5 8 10 2-1.4 4.3-3.3 6-5.5"></path><path d="M3 12h3l1.5-3L11 15l2-6 1.5 3H21"></path>',
  shieldCheck: '<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"></path><path d="M9 12l2 2 4-4"></path>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>',
  flash: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"></path>',
  checkBadge: '<path d="M12 2l2.2 1.3 2.5-.3 1.1 2.3 2.3 1.1-.3 2.5L21 11l-1.3 2.2.3 2.5-2.3 1.1-1.1 2.3-2.5-.3L12 20l-2.2-1.3-2.5.3-1.1-2.3-2.3-1.1.3-2.5L3 11l1.3-2.2-.3-2.5 2.3-1.1 1.1-2.3 2.5.3z"></path><path d="M9 12l2 2 4-4"></path>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><line x1="16" y1="3" x2="16" y2="7"></line><line x1="8" y1="3" x2="8" y2="7"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
  gear: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z"></path>',
  home: '<path d="M3 11 12 4l9 7"></path><path d="M5 10v10h14V10"></path>',
  ambulance: '<rect x="1" y="9" width="14" height="8" rx="1"></rect><path d="M15 12h3l3 3v2h-6z"></path><circle cx="6" cy="19" r="1.5"></circle><circle cx="16.5" cy="19" r="1.5"></circle><line x1="7" y1="12" x2="7" y2="15"></line><line x1="5.5" y1="13.5" x2="8.5" y2="13.5"></line>',
  arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>',
  clock: '<circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 16 14"></polyline>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
  menu: '<line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line>',
  close: '<line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line>',
};

export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {Object.entries(PATHS).map(([id, inner]) => (
          <g key={id} id={`i-${id}`} dangerouslySetInnerHTML={{ __html: inner }} />
        ))}
      </defs>
    </svg>
  );
}

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}
