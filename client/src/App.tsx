import React from 'react';
import Downloader from './components/Downloader';
import { DownloadCloud } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden selection:bg-indigo-500/30">
      {/* Subtle Background Mesh */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] opacity-30" />
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-surface-light rounded-lg border border-surface-border">
            <DownloadCloud className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            MindTube
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 flex flex-col items-center justify-center py-12 z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            Universal Media <br /> Downloader
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto font-light">
            Save high-quality content from YouTube and Instagram. <br className="hidden md:block" />
            Simple, fast, and secure. No ads, no limits.
          </p>
        </div>

        <div className="w-full animate-slide-up">
          <Downloader />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-surface-border mt-auto z-10 bg-midnight-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
          <p>© 2025 MindTube. Built for creators.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
