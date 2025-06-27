export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-indigo-950 text-white py-6 sm:py-8 px-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Glassmorphism layer */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              🎬
            </div>
            <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
              Moviemo
            </span>
          </div>

          {/* Copyright Text */}
          <p className="text-sm sm:text-base text-white/70 text-center max-w-md">
            © {new Date().getFullYear()} Moviemo. All rights reserved.
          </p>

          {/* Decorative divider */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

          {/* Additional Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-white/50">
            <span>Great movies, amazing moments</span>
            <span className="hidden sm:inline">•</span>
            <span>1000+ movies on our platform</span>
            <span className="hidden sm:inline">•</span>
            <span>Always the best for you</span>
          </div>
        </div>
      </div>

      {/* Animated gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-pink-500/20 mix-blend-overlay"></div>
      </div>
    </footer>
  );
}
