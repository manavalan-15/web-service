interface TechLogoMarkProps {
  id: string;
}

export function TechLogoMark({ id }: TechLogoMarkProps) {
  switch (id) {
    case 'html':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <path d="M4 3L5.4 18.8L12 21L18.6 18.8L20 3H4Z" fill="#E34F26" />
          <path d="M12 4.4V19.5L17.3 17.8L18.4 4.4H12Z" fill="#EF652A" />
          <path
            d="M7.8 7.5H16.2L16 9.6H9.9L10.1 11.7H15.8L15.3 16.5L12 17.5L8.7 16.5L8.5 13.9H10.5L10.6 15L12 15.4L13.4 15L13.6 13.5H8.3L7.8 7.5Z"
            fill="#FFFFFF"
          />
        </svg>
      );
    case 'css':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <path d="M4 3L5.4 18.8L12 21L18.6 18.8L20 3H4Z" fill="#1572B6" />
          <path d="M12 4.4V19.5L17.3 17.8L18.4 4.4H12Z" fill="#33A9DC" />
          <path
            d="M7.8 7.5H16.2L15.9 9.6H12L15.7 11.2L15.3 16.5L12 17.5L8.7 16.5L8.5 13.9H10.5L10.6 15L12 15.4L13.4 15L13.6 13.2H8.4L8.2 11.2H12.3L8 9.4L7.8 7.5Z"
            fill="#FFFFFF"
          />
        </svg>
      );
    case 'react':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="2.1" fill="#0284C7" />
          <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="#0284C7" strokeWidth="1.4" />
          <ellipse
            cx="12"
            cy="12"
            rx="9.5"
            ry="3.8"
            transform="rotate(60 12 12)"
            stroke="#0284C7"
            strokeWidth="1.4"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="9.5"
            ry="3.8"
            transform="rotate(120 12 12)"
            stroke="#0284C7"
            strokeWidth="1.4"
          />
        </svg>
      );
    case 'nextjs':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" fill="#0F172A" />
          <path
            d="M8.5 16V8.5L16.5 18"
            stroke="#FFFFFF"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M15.5 8.5V13.5" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'javascript':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="#FACC15" />
          <path
            d="M11 10.5V15.5C11 16.6 10.3 17.2 9.2 17.2C8.4 17.2 7.9 16.8 7.5 16.2"
            stroke="#0F172A"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M16.8 11.2C16.4 10.7 15.8 10.4 15 10.4C14 10.4 13.4 11 13.4 11.7C13.4 12.5 14 12.9 15.2 13.3C16.3 13.7 17 14.2 17 15.2C17 16.3 16.1 17.1 14.8 17.1C13.7 17.1 13 16.6 12.6 16"
            stroke="#0F172A"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'python':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <path
            d="M12 3.5C9.2 3.5 9.5 4.8 9.5 4.8V6.8H14.5V7.8H7.5C7.5 7.8 4.5 7.5 4.5 11.2C4.5 14.9 7 14.7 7 14.7H8.8V12.8C8.8 12.8 8.7 10.4 11.2 10.4H14.5C14.5 10.4 16.5 10.4 16.5 8.4V5.6C16.5 5.6 16.8 3.5 12 3.5Z"
            fill="#2563EB"
          />
          <path
            d="M12 20.5C14.8 20.5 14.5 19.2 14.5 19.2V17.2H9.5V16.2H16.5C16.5 16.2 19.5 16.5 19.5 12.8C19.5 9.1 17 9.3 17 9.3H15.2V11.2C15.2 11.2 15.3 13.6 12.8 13.6H9.5C9.5 13.6 7.5 13.6 7.5 15.6V18.4C7.5 18.4 7.2 20.5 12 20.5Z"
            fill="#F59E0B"
          />
          <circle cx="10.8" cy="5.5" r="0.8" fill="#FFFFFF" />
          <circle cx="13.2" cy="18.5" r="0.8" fill="#FFFFFF" />
        </svg>
      );
    case 'django':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#064E3B" />
          <path
            d="M11 6.5V15.8C9.8 16.1 8.8 16.1 8 15.7C7 15.2 6.5 14.2 6.5 13C6.5 11.6 7.4 10.6 9.1 10.6C9.8 10.6 10.4 10.8 11 11.1"
            stroke="#FFFFFF"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M14.5 10.2V15.2C14.5 16.8 13.8 17.8 12.6 18.3"
            stroke="#FFFFFF"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="14.5" cy="7.3" r="1" fill="#FFFFFF" />
        </svg>
      );
    case 'nodejs':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <path
            d="M12 2.8L20 7.4V16.6L12 21.2L4 16.6V7.4L12 2.8Z"
            fill="#15803D"
          />
          <path
            d="M9.5 14.8V9.2L14.5 14.8V9.2"
            stroke="#FFFFFF"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'php':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <ellipse cx="12" cy="12" rx="10" ry="6.2" fill="#4F46E5" />
          <path
            d="M7.2 14.2V9.8H9C9.8 9.8 10.3 10.3 10.3 11.1C10.3 11.9 9.8 12.4 9 12.4H7.2M12 14.2V9.8M12 12H14M14 9.8V14.2M15.8 14.2V9.8H17.5C18.3 9.8 18.8 10.3 18.8 11.1C18.8 11.9 18.3 12.4 17.5 12.4H15.8"
            stroke="#FFFFFF"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'mysql':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <ellipse cx="12" cy="6.5" rx="7" ry="2.8" stroke="#0369A1" strokeWidth="1.6" />
          <path
            d="M5 6.5V17.5C5 19.05 8.13 20.3 12 20.3C15.87 20.3 19 19.05 19 17.5V6.5"
            stroke="#0369A1"
            strokeWidth="1.6"
          />
          <path d="M5 12C5 13.55 8.13 14.8 12 14.8C15.87 14.8 19 13.55 19 12" stroke="#D97706" strokeWidth="1.6" />
        </svg>
      );
    case 'postgresql':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <path
            d="M16.8 6.5C15.5 4.8 13.5 4 11.5 4.2C8.3 4.5 6 7 6 10.2C6 12.2 6.8 13.8 8 15V18.8C8 19.5 8.6 20 9.3 20C10 20 10.5 19.5 10.5 18.8V16.2C11.1 16.4 11.7 16.5 12.4 16.4L13.5 19C13.8 19.6 14.4 20 15.1 20C15.9 20 16.5 19.3 16.5 18.5V14.2C17.6 13.1 18.2 11.6 18.2 10C18.2 8.7 17.7 7.5 16.8 6.5Z"
            fill="#336791"
          />
          <circle cx="10.2" cy="9.5" r="1" fill="#FFFFFF" />
          <circle cx="14.2" cy="9.5" r="1" fill="#FFFFFF" />
        </svg>
      );
    case 'mongodb':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <path
            d="M12 3C12 3 17.2 8.2 17.2 13.5C17.2 17.2 14.4 19.6 12 20.5C9.6 19.6 6.8 17.2 6.8 13.5C6.8 8.2 12 3 12 3Z"
            fill="#16A34A"
          />
          <path d="M12 8.5V21.5" stroke="#DCFCE7" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'tailwind':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <path
            d="M7 10.5C7.8 7.8 9.6 6.5 12.2 6.5C15.8 6.5 16.3 9.2 18.1 9.6C19.3 9.9 20.3 9.4 21.2 8.3C20.4 11 18.6 12.3 16 12.3C12.4 12.3 11.9 9.6 10.1 9.2C8.9 8.9 7.9 9.4 7 10.5ZM3 15.5C3.8 12.8 5.6 11.5 8.2 11.5C11.8 11.5 12.3 14.2 14.1 14.6C15.3 14.9 16.3 14.4 17.2 13.3C16.4 16 14.6 17.3 12 17.3C8.4 17.3 7.9 14.6 6.1 14.2C4.9 13.9 3.9 14.4 3 15.5Z"
            fill="#0284C7"
          />
        </svg>
      );
    case 'bootstrap':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <rect x="3" y="3.5" width="18" height="17" rx="4" fill="#6D28D9" />
          <path
            d="M9 16V8H12.5C13.8 8 14.6 8.7 14.6 9.8C14.6 10.7 14 11.4 13.1 11.6C14.2 11.8 15 12.6 15 13.8C15 15.1 14.1 16 12.6 16H9ZM10.7 11.2H12.2C12.8 11.2 13.1 10.8 13.1 10.3C13.1 9.8 12.8 9.4 12.2 9.4H10.7V11.2ZM10.7 14.6H12.4C13.1 14.6 13.4 14.1 13.4 13.5C13.4 12.9 13.1 12.5 12.4 12.5H10.7V14.6Z"
            fill="#FFFFFF"
          />
        </svg>
      );
    case 'figma':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <path d="M9 3.5H12V9H9C7.48 9 6.25 7.77 6.25 6.25C6.25 4.73 7.48 3.5 9 3.5Z" fill="#EA580C" />
          <path d="M12 3.5H15C16.52 3.5 17.75 4.73 17.75 6.25C17.75 7.77 16.52 9 15 9H12V3.5Z" fill="#FB7185" />
          <path d="M9 9H12V14.5H9C7.48 14.5 6.25 13.27 6.25 11.75C6.25 10.23 7.48 9 9 9Z" fill="#7C3AED" />
          <path d="M9 14.5H12V17.25C12 18.77 10.77 20 9.25 20C7.73 20 6.5 18.77 6.5 17.25C6.5 15.73 7.73 14.5 9.25 14.5H9Z" fill="#16A34A" />
          <circle cx="14.8" cy="11.75" r="2.75" fill="#0284C7" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12C2.5 16.2 5.22 19.76 9 21.02C9.47 21.1 9.65 20.82 9.65 20.57C9.65 20.34 9.64 19.6 9.64 18.8C7.25 19.24 6.63 18.21 6.44 17.68C6.33 17.4 5.87 16.55 5.47 16.32C5.14 16.14 4.66 15.7 5.46 15.69C6.21 15.68 6.75 16.38 6.93 16.66C7.79 18.1 9.16 17.7 9.71 17.45C9.8 16.83 10.05 16.41 10.32 16.17C8.21 15.93 6 15.11 6 11.48C6 10.45 6.37 9.6 6.97 8.94C6.87 8.7 6.54 7.73 7.06 6.42C7.06 6.42 7.85 6.17 9.66 7.39C10.42 7.18 11.22 7.07 12.02 7.07C12.82 7.07 13.62 7.18 14.38 7.39C16.19 6.16 16.98 6.42 16.98 6.42C17.5 7.73 17.17 8.7 17.07 8.94C17.67 9.6 18.04 10.44 18.04 11.48C18.04 15.12 15.82 15.93 13.71 16.17C14.06 16.47 14.36 17.04 14.36 17.94C14.36 19.22 14.35 20.25 14.35 20.57C14.35 20.82 14.53 21.11 15 21.02C18.78 19.76 21.5 16.2 21.5 12C21.5 6.75 17.25 2.5 12 2.5Z"
            fill="#0F172A"
          />
        </svg>
      );
    case 'vscode':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <path
            d="M17.5 3.2L10 10.1L5.7 6.8L4 7.7V16.3L5.7 17.2L10 13.9L17.5 20.8L20.5 19.3V4.7L17.5 3.2ZM17.5 8.1V15.9L12.6 12L17.5 8.1Z"
            fill="#007ACC"
          />
        </svg>
      );
    case 'docker':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <rect x="6" y="9" width="2.8" height="2.4" rx="0.4" fill="#2496ED" />
          <rect x="9.4" y="9" width="2.8" height="2.4" rx="0.4" fill="#2496ED" />
          <rect x="12.8" y="9" width="2.8" height="2.4" rx="0.4" fill="#2496ED" />
          <rect x="9.4" y="6" width="2.8" height="2.4" rx="0.4" fill="#2496ED" />
          <rect x="12.8" y="6" width="2.8" height="2.4" rx="0.4" fill="#2496ED" />
          <path
            d="M3.2 12.6H18.5C19.5 12.6 20.5 11.7 21 10.6C20.2 10.2 19 10.3 18.4 10.8C18 11.1 17.8 11.6 17.8 12.2H3.2C3 15.8 6 19 10.8 19C15.4 19 18.8 16.4 19.6 12.6"
            fill="#2496ED"
          />
        </svg>
      );
    case 'git':
    default:
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
          <path d="M12 3L21 12L12 21L3 12L12 3Z" fill="#DC2626" />
          <circle cx="12" cy="9.5" r="1.4" fill="#FFFFFF" />
          <circle cx="12" cy="15.5" r="1.4" fill="#FFFFFF" />
          <circle cx="15.5" cy="12" r="1.4" fill="#FFFFFF" />
          <path d="M12 10.8V14.2M12.9 10.2L14.6 11.3" stroke="#FFFFFF" strokeWidth="1.4" />
        </svg>
      );
  }
}
