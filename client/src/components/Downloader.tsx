import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Youtube, Instagram, Loader2, Music, Video, ArrowRight, Check } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Downloader: React.FC = () => {
    const [url, setUrl] = useState('');
    const [platform, setPlatform] = useState<'youtube' | 'instagram'>('youtube');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [metadata, setMetadata] = useState<any>(null);

    const handleFetchInfo = async () => {
        if (!url) return;
        setLoading(true);
        setError('');
        setMetadata(null);

        try {
            const endpoint = platform === 'youtube' ? '/youtube/info' : '/instagram/info';
            const response = await axios.post(`${API_BASE_URL}${endpoint}`, { url });
            setMetadata(response.data);
        } catch (err) {
            setError('Failed to fetch info. Please check the URL.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (format: string = 'video') => {
        if (platform === 'youtube') {
            window.location.href = `${API_BASE_URL}/youtube/download?url=${encodeURIComponent(url)}&format=${format}`;
        } else {
            if (metadata?.url_list?.length > 0) {
                metadata.url_list.forEach((mediaUrl: string) => {
                    window.open(mediaUrl, '_blank');
                });
            } else if (metadata?.media_url) {
                window.open(metadata.media_url, '_blank');
            }
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Segmented Control */}
            <div className="flex justify-center mb-10">
                <div className="bg-surface-light p-1 rounded-full border border-surface-border inline-flex relative">
                    {/* Active Indicator */}
                    <motion.div
                        className="absolute top-1 bottom-1 bg-indigo-600 rounded-full shadow-lg"
                        initial={false}
                        animate={{
                            left: platform === 'youtube' ? '4px' : '50%',
                            width: 'calc(50% - 4px)',
                            x: platform === 'youtube' ? 0 : 0
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    <button
                        onClick={() => { setPlatform('youtube'); setMetadata(null); setError(''); }}
                        className={`relative z-10 flex items-center px-8 py-2.5 rounded-full transition-colors duration-200 ${platform === 'youtube' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Youtube className="mr-2 w-4 h-4" />
                        <span className="font-medium text-sm">YouTube</span>
                    </button>
                    <button
                        onClick={() => { setPlatform('instagram'); setMetadata(null); setError(''); }}
                        className={`relative z-10 flex items-center px-8 py-2.5 rounded-full transition-colors duration-200 ${platform === 'instagram' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Instagram className="mr-2 w-4 h-4" />
                        <span className="font-medium text-sm">Instagram</span>
                    </button>
                </div>
            </div>

            {/* Input Card */}
            <div className="bg-surface-light backdrop-blur-xl border border-surface-border rounded-3xl p-2 shadow-2xl">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        placeholder={`Paste ${platform === 'youtube' ? 'YouTube' : 'Instagram'} link here...`}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFetchInfo()}
                        className="w-full pl-6 pr-36 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg font-light"
                    />
                    <div className="absolute right-2 top-2 bottom-2">
                        <button
                            onClick={handleFetchInfo}
                            disabled={loading || !url}
                            className="h-full px-6 bg-white text-midnight-900 rounded-xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center text-sm"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result Card */}
            <AnimatePresence>
                {metadata && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-8 bg-surface-light backdrop-blur-md border border-surface-border rounded-3xl p-6 shadow-2xl overflow-hidden"
                    >
                        <div className="flex flex-col md:flex-row gap-6">
                            {metadata.thumbnail && (
                                <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden shadow-lg bg-surface-medium">
                                    <img
                                        src={metadata.thumbnail}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-white leading-snug">
                                    {metadata.title || 'Media Ready'}
                                </h3>

                                <div className="flex items-center text-xs text-indigo-400 mb-6 font-medium tracking-wide uppercase">
                                    <Check className="w-3 h-3 mr-1.5" /> Ready to download
                                </div>

                                {platform === 'youtube' ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleDownload('video')}
                                            className="flex-1 flex items-center justify-center px-4 py-3 bg-surface-medium hover:bg-surface-border border border-surface-border rounded-xl transition-all group"
                                        >
                                            <Video className="w-4 h-4 text-indigo-400 mr-2 group-hover:text-white transition-colors" />
                                            <span className="text-sm font-medium">Video</span>
                                        </button>
                                        <button
                                            onClick={() => handleDownload('audio')}
                                            className="flex-1 flex items-center justify-center px-4 py-3 bg-surface-medium hover:bg-surface-border border border-surface-border rounded-xl transition-all group"
                                        >
                                            <Music className="w-4 h-4 text-indigo-400 mr-2 group-hover:text-white transition-colors" />
                                            <span className="text-sm font-medium">Audio</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleDownload()}
                                        className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                                    >
                                        <Download className="mr-2 w-4 h-4" />
                                        <span className="font-medium text-sm">Download Media</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Downloader;
