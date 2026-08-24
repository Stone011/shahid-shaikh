export type VideoPlatform =
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'vimeo'
  | 'tiktok'
  | 'twitter'
  | 'loom'
  | 'dailymotion'
  | 'googledrive'
  | 'direct'
  | 'external';

export interface VideoInfo {
  platform: VideoPlatform;
  platformName: string;
  platformColor: string;
  platformBg: string;
  embedType: 'iframe' | 'video' | 'fallback';
  embedUrl: string | null;
  aspectRatio: '16/9' | '9/16' | '1/1' | '4/3';
  isVertical: boolean;
  canEmbedDirectly: boolean;
  originalUrl: string;
  videoId?: string;
  cleanEmbedUrl?: string;
  fallbackReason?: string;
  embedNotice?: string;
}

/**
 * Helper to parse timestamp parameters like 't=120', 't=2m30s', 'start=90' into seconds
 */
function parseTimestampSeconds(url: string): number | null {
  try {
    const urlObj = new URL(url);
    const tParam = urlObj.searchParams.get('t') || urlObj.searchParams.get('start');
    if (!tParam) return null;

    // Pure number
    if (/^\d+$/.test(tParam)) {
      return parseInt(tParam, 10);
    }

    // Format like '1h2m30s' or '2m30s' or '45s'
    let totalSeconds = 0;
    const hoursMatch = tParam.match(/(\d+)h/i);
    const minsMatch = tParam.match(/(\d+)m/i);
    const secsMatch = tParam.match(/(\d+)s/i);

    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
    if (minsMatch) totalSeconds += parseInt(minsMatch[1], 10) * 60;
    if (secsMatch) totalSeconds += parseInt(secsMatch[1], 10);

    return totalSeconds > 0 ? totalSeconds : null;
  } catch {
    return null;
  }
}

/**
 * Extracts comprehensive video playback metadata & canonical embed URLs
 * for YouTube, Instagram, Facebook, Vimeo, TikTok, X (Twitter), Loom, Dailymotion, Google Drive, and Direct Files.
 */
export function parseVideoUrl(rawUrl: string, requestedAspect?: string): VideoInfo {
  const url = (rawUrl || '').trim();

  const defaultAspect: '16/9' | '9/16' = requestedAspect === '9:16' || requestedAspect === '9/16' ? '9/16' : '16/9';

  if (!url) {
    return {
      platform: 'external',
      platformName: 'Video Link',
      platformColor: '#d97706',
      platformBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      embedType: 'fallback',
      embedUrl: null,
      aspectRatio: defaultAspect,
      isVertical: defaultAspect === '9/16',
      canEmbedDirectly: false,
      originalUrl: '',
      fallbackReason: 'No video URL provided.',
    };
  }

  // 1. DIRECT VIDEO FILE (mp4, webm, ogg, mov, m4v, blob, data-uri)
  if (url.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) || url.startsWith('blob:') || url.startsWith('data:video')) {
    return {
      platform: 'direct',
      platformName: 'Direct HD Video',
      platformColor: '#10b981',
      platformBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      embedType: 'video',
      embedUrl: url,
      aspectRatio: defaultAspect,
      isVertical: defaultAspect === '9/16',
      canEmbedDirectly: true,
      originalUrl: url,
    };
  }

  // 2. YOUTUBE (watch, youtu.be, shorts, embed, v, live)
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const isShorts = url.includes('/shorts/') || defaultAspect === '9/16';
    const startSecs = parseTimestampSeconds(url);
    const startParam = startSecs ? `&start=${startSecs}` : '';

    return {
      platform: 'youtube',
      platformName: isShorts ? 'YouTube Shorts' : 'YouTube',
      platformColor: '#ef4444',
      platformBg: 'bg-red-500/20 text-red-300 border-red-500/30',
      embedType: 'iframe',
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&playsinline=1${startParam}`,
      aspectRatio: isShorts ? '9/16' : '16/9',
      isVertical: isShorts,
      canEmbedDirectly: true,
      originalUrl: url,
      videoId,
    };
  }

  // 3. INSTAGRAM (Reels, Posts, IGTV, Share Links, Mobile, Username paths, with/without trailing slash or ?igsh= query params)
  const trimmedUrl = url.trim();
  const igMatch =
    trimmedUrl.match(
      /(?:instagram\.com|instagr\.am)\/(?:(?:[^\/\s?#]+\/)?(?:p|reel|reels|tv|share\/reel|share\/p)|(?:p|reel|reels|tv|share\/reel|share\/p))\/([A-Za-z0-9_-]+)/i
    ) ||
    trimmedUrl.match(
      /(?:instagram\.com|instagr\.am).*?\/(?:p|reel|reels|tv|share\/reel|share\/p)\/([A-Za-z0-9_-]+)/i
    );

  if (igMatch && igMatch[1]) {
    const code = igMatch[1];
    const isReel = trimmedUrl.includes('/reel') || defaultAspect === '9/16';
    // Produce clean canonical embed URL without trailing tracking params
    const cleanEmbed = `https://www.instagram.com/p/${code}/embed/`;

    return {
      platform: 'instagram',
      platformName: isReel ? 'Instagram Reel' : 'Instagram Video',
      platformColor: '#ec4899',
      platformBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      embedType: 'iframe',
      embedUrl: cleanEmbed,
      aspectRatio: '9/16',
      isVertical: true,
      canEmbedDirectly: true,
      originalUrl: trimmedUrl,
      videoId: code,
      embedNotice: 'If Instagram requires login or privacy confirmation in your browser, tap "Watch on Instagram" to view directly.',
    };
  }

  // 4. FACEBOOK VIDEO / REELS (watch, videos, reel, fb.watch, fb.com)
  if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) {
    const isFbReel = url.includes('/reel/') || defaultAspect === '9/16';
    const fbEmbedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      url
    )}&show_text=0&autoplay=1&mute=0`;
    return {
      platform: 'facebook',
      platformName: isFbReel ? 'Facebook Reel' : 'Facebook Video',
      platformColor: '#3b82f6',
      platformBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      embedType: 'iframe',
      embedUrl: fbEmbedUrl,
      aspectRatio: isFbReel ? '9/16' : '16/9',
      isVertical: isFbReel,
      canEmbedDirectly: true,
      originalUrl: url,
    };
  }

  // 5. VIMEO (standard, player, channels, ondemand)
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)|player\.vimeo\.com\/video\/)(\d+)/i
  );
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      platform: 'vimeo',
      platformName: 'Vimeo',
      platformColor: '#06b6d4',
      platformBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      embedType: 'iframe',
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`,
      aspectRatio: defaultAspect,
      isVertical: defaultAspect === '9/16',
      canEmbedDirectly: true,
      originalUrl: url,
      videoId,
    };
  }

  // 6. GOOGLE DRIVE (drive.google.com/file/d/ID/view)
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]+)/i);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      platform: 'googledrive',
      platformName: 'Google Drive Video',
      platformColor: '#eab308',
      platformBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      embedType: 'iframe',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      aspectRatio: defaultAspect,
      isVertical: defaultAspect === '9/16',
      canEmbedDirectly: true,
      originalUrl: url,
      videoId: fileId,
      embedNotice: "Ensure the Google Drive video permission is set to 'Anyone with the link can view'.",
      fallbackReason: "If preview doesn't load, verify that file sharing permissions are set to 'Anyone with the link'.",
    };
  }

  // 7. TIKTOK (standard video, @user/video/ID, v/ID, vm.tiktok.com)
  const tiktokMatch = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)(\d+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    const videoId = tiktokMatch[1];
    return {
      platform: 'tiktok',
      platformName: 'TikTok',
      platformColor: '#f43f5e',
      platformBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      embedType: 'iframe',
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}?lang=en`,
      aspectRatio: '9/16',
      isVertical: true,
      canEmbedDirectly: true,
      originalUrl: url,
      videoId,
    };
  }
  if (url.includes('tiktok.com')) {
    return {
      platform: 'tiktok',
      platformName: 'TikTok',
      platformColor: '#f43f5e',
      platformBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      embedType: 'fallback',
      embedUrl: null,
      aspectRatio: '9/16',
      isVertical: true,
      canEmbedDirectly: false,
      originalUrl: url,
      fallbackReason: 'TikTok short links require opening directly in the TikTok app or browser.',
    };
  }

  // 8. X / TWITTER (twitter.com, x.com)
  const twitterMatch = url.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/i);
  if (twitterMatch) {
    const statusId = twitterMatch[2];
    const username = twitterMatch[1];
    return {
      platform: 'twitter',
      platformName: 'X (Twitter)',
      platformColor: '#38bdf8',
      platformBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      embedType: 'fallback',
      embedUrl: null,
      aspectRatio: defaultAspect,
      isVertical: defaultAspect === '9/16',
      canEmbedDirectly: false,
      originalUrl: url,
      videoId: statusId,
      fallbackReason: `X (Twitter) restricts external web embeds. Watch @${username}'s post directly on X.`,
    };
  }

  // 9. LOOM (loom.com/share/ID)
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/i);
  if (loomMatch && loomMatch[1]) {
    const videoId = loomMatch[1];
    return {
      platform: 'loom',
      platformName: 'Loom Video',
      platformColor: '#6366f1',
      platformBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      embedType: 'iframe',
      embedUrl: `https://www.loom.com/embed/${videoId}?autoplay=1`,
      aspectRatio: '16/9',
      isVertical: false,
      canEmbedDirectly: true,
      originalUrl: url,
      videoId,
    };
  }

  // 10. DAILYMOTION (dailymotion.com/video/ID, dai.ly/ID)
  const dmMatch = url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([\w-]+)/i);
  if (dmMatch && dmMatch[1]) {
    const videoId = dmMatch[1];
    return {
      platform: 'dailymotion',
      platformName: 'Dailymotion',
      platformColor: '#0284c7',
      platformBg: 'bg-sky-600/20 text-sky-300 border-sky-600/30',
      embedType: 'iframe',
      embedUrl: `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`,
      aspectRatio: '16/9',
      isVertical: false,
      canEmbedDirectly: true,
      originalUrl: url,
      videoId,
    };
  }

  // 11. GENERIC EMBEDDABLE HTTPS URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return {
      platform: 'external',
      platformName: 'Web Video',
      platformColor: '#a855f7',
      platformBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      embedType: 'iframe',
      embedUrl: url,
      aspectRatio: defaultAspect,
      isVertical: defaultAspect === '9/16',
      canEmbedDirectly: true,
      originalUrl: url,
    };
  }

  // Fallback
  return {
    platform: 'external',
    platformName: 'External Link',
    platformColor: '#d97706',
    platformBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    embedType: 'fallback',
    embedUrl: null,
    aspectRatio: defaultAspect,
    isVertical: defaultAspect === '9/16',
    canEmbedDirectly: false,
    originalUrl: url,
    fallbackReason: 'This URL format cannot be previewed in an embedded player.',
  };
}
