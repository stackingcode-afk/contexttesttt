/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Terminal Green Theme
        'terminal-green': '#00FF91',
        'terminal-green-light': '#33FFB2',
        'terminal-green-dark': '#00CC74',
        
        // Dark backgrounds
        'darkest-bg': '#030305',
        'darker-bg': '#0A0A0F',
        'dark-bg': '#111118',
        
        // Card backgrounds
        'card-bg': '#1A1A24',
        'card-hover': '#252530',
        
        // Surface colors
        'surface-800': '#1e1e1e',
        'surface-700': '#2a2a2a',
        'surface-600': '#363636',
        'surface-500': '#424242',
        
        // Text colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#E0E0E0',
        'text-gray': '#A0A0A0',
        'text-muted': '#707070',
        
        // Border colors
        'border-light': '#333333',
        'border-gray': '#404040',
        
        // Accent colors
        'accent-purple': '#8B5CF6',
        'accent-purple-light': '#A78BFA',
        'accent-blue': '#3B82F6',
        'accent-blue-light': '#60A5FA',
        'accent-orange': '#F97316',
        'accent-orange-light': '#FB923C',
        
        // Glass morphism
        'glass-bg': 'rgba(26, 26, 36, 0.8)',
        'glass-hover': 'rgba(37, 37, 48, 0.9)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'glass-border-hover': 'rgba(0, 255, 145, 0.3)',
        'glass-shine': 'rgba(255, 255, 255, 0.05)',
      },
      
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      
      boxShadow: {
        'glow': '0 0 20px rgba(0, 255, 145, 0.4)',
        'glow-sm': '0 0 10px rgba(0, 255, 145, 0.3)',
        'glow-lg': '0 0 30px rgba(0, 255, 145, 0.5)',
        'glow-xl': '0 0 40px rgba(0, 255, 145, 0.6)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-lg': '0 16px 40px 0 rgba(0, 0, 0, 0.4)',
        'glass-xl': '0 24px 48px 0 rgba(0, 0, 0, 0.5)',
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-shine': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
      },
      
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};