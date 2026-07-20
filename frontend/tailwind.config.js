import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        'soft-tilt': 'softTilt 6s ease-in-out infinite',
        'soft-tilt-reverse': 'softTiltReverse 7s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'pulse-glow-secondary': 'pulseGlowSecondary 5s ease-in-out infinite',
        'float-glow': 'floatGlow 6s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
        'typing-dot': 'typingDot 1.4s infinite ease-in-out',
        'wave': 'wave 1.2s infinite ease-in-out',
        'slide-in-toast': 'slideInToast 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'message-appear': 'messageAppear 0.4s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        softTilt: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        softTiltReverse: {
          '0%, 100%': { transform: 'rotate(2deg)' },
          '50%': { transform: 'rotate(-2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px 0px hsl(var(--p) / 0.2)' },
          '50%': { boxShadow: '0 0 25px 5px hsl(var(--p) / 0.5)' }
        },
        pulseGlowSecondary: {
          '0%, 100%': { boxShadow: '0 0 10px 0px hsl(var(--s) / 0.2)' },
          '50%': { boxShadow: '0 0 25px 5px hsl(var(--s) / 0.5)' }
        },
        floatGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 15px 0px hsl(var(--p) / 0.1)',
            transform: 'translateY(0) rotate(-1deg)'
          },
          '50%': { 
            boxShadow: '0 0 30px 10px hsl(var(--p) / 0.4)',
            transform: 'translateY(-8px) rotate(1deg)'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        typingDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-4px)', opacity: '1' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        slideInToast: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        messageAppear: {
          '0%': { transform: 'scale(0.95) translateY(10px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
  },
};