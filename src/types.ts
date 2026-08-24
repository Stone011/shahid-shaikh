export interface SectionVisibility {
  hero: boolean;
  about: boolean;
  videoEditing: boolean;
  weddingFilms: boolean;
  cinematic: boolean;
  trailers: boolean;
  teasers: boolean;
  reels: boolean;
  photography: boolean;
  shootServices: boolean;
  videoDirection: boolean;
  mySongs: boolean;
  experience: boolean;
  skills: boolean;
  contact: boolean;
}

export interface StatItem {
  id: string;
  number: string;
  label: string;
  subtext?: string;
}

export interface CatalogNode {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  parentId?: string | null;
  order?: number;
  children?: CatalogNode[];
}

export interface VideoProject {
  id: string;
  title: string;
  catalogId?: string;
  catalogIds?: string[];
  categoryPath?: string[];
  category: 'Wedding Films' | 'Cinematic' | 'Trailers' | 'Teasers' | 'Reels' | 'Commercial & Teasers' | 'Podcasts' | 'Social Media / Short-form' | 'Music Videos' | 'VERTICAL COMMERCIAL' | string;
  year: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  client?: string;
  duration?: string;
  tags?: string[];
  buttonText?: string;
  featured?: boolean;
  aspectRatio?: '16:9' | '9:16' | '4:3' | '1:1';
  viewsCount?: string;
  likesCount?: string;
  audioTrack?: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  catalogId?: string;
  catalogIds?: string[];
  categoryPath?: string[];
  category: 'WEDDINGS' | 'PORTRAITS' | 'EVENTS' | 'LIFESTYLE' | 'STREET' | 'CREATIVE' | string;
  description?: string;
  imageUrl: string;
  aspect?: 'portrait' | 'landscape' | 'square';
  location?: string;
  year?: string;
}

export interface ShootService {
  id: string;
  title: string;
  category?: string;
  categories?: string[];
  catalogId?: string;
  catalogIds?: string[];
  description: string;
  imageUrl: string;
  link?: string;
  deliverables?: string[];
  turnaround?: string;
  priceStarting?: string;
}

export interface DirectionProject {
  id: string;
  title: string;
  category: string;
  categories?: string[];
  catalogId?: string;
  catalogIds?: string[];
  year: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  credits: {
    director?: string;
    dop?: string;
    editor?: string;
    colorist?: string;
    soundDesign?: string;
    client?: string;
  };
  concept?: string;
  duration?: string;
}

export interface YouTubeSong {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeUrl: string;
  views?: string;
  year?: string;
  catalogId?: string;
  catalogIds?: string[];
  category?: string;
  description?: string;
}

export interface SpotifySong {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  spotifyUrl: string;
  album?: string;
  catalogId?: string;
  catalogIds?: string[];
  category?: string;
  description?: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl: string;
  duration: string;
  genre?: string;
  bpm?: string;
  catalogId?: string;
  catalogIds?: string[];
  category?: string;
  description?: string;
  lyrics?: string;
}

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  coverImage?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  audioUrl?: string;
  audioFile?: string;
  description?: string;
  year?: string;
  catalogId?: string;
  catalogIds?: string[];
  category?: string;
  lyrics?: string;
  duration?: string;
  genre?: string;
  bpm?: string;
}

export interface SongsData {
  youtubeSongs: YouTubeSong[];
  spotifySongs: SpotifySong[];
  audioTracks: AudioTrack[];
  allSongs?: SongItem[];
}

export interface TrashItem {
  id: string;
  originalId: string;
  itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song' | 'experience' | 'catalog';
  title: string;
  deletedAt: string;
  data: any;
  sourceCatalogId?: string;
  sourceCategory?: string;
}

export interface BackupItem {
  id: string;
  timestamp: string;
  label: string;
  itemCount: number;
  dataSnapshot: PortfolioData;
}

export interface ExperienceItem {
  id: string;
  year: string;
  company: string;
  position: string;
  description: string;
  logo?: string;
  websiteUrl?: string;
  highlights?: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface GeneralSettings {
  siteTitle: string;
  metaDescription: string;
  brandName: string;
  primaryAccent: string;
  availableForHire: boolean;
  availabilityText: string;
}

export interface HeroData {
  name: string;
  tagline: string;
  subRoles: string[];
  bioQuote: string;
  backgroundImage: string;
  backgroundVideoUrl?: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  experienceBadge: string;
  statusBadge: string;
}

export interface AboutData {
  title: string;
  headline: string;
  paragraphs: string[];
  profileImage: string;
  secondaryImage?: string;
  stats: StatItem[];
  philosophyQuote: string;
}

export interface ContactData {
  name: string;
  headline: string;
  subheading: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  location: string;
  instagramName: string;
  instagramUrl: string;
  youtubeUrl?: string;
  vimeoUrl?: string;
  linkedinUrl?: string;
  whatsappNumber?: string;
}

export interface PortfolioData {
  general: GeneralSettings;
  hero: HeroData;
  about: AboutData;
  sections?: SectionVisibility;
  globalCatalogues?: string[];
  videoCatalogTree?: CatalogNode[];
  photoCatalogTree?: CatalogNode[];
  songCatalogTree?: CatalogNode[];
  videoCatalogues?: string[];
  photoCatalogues?: string[];
  songCatalogues?: string[];
  videoProjects: VideoProject[];
  photography: PhotoItem[];
  shootServices: ShootService[];
  directionProjects: DirectionProject[];
  songs: SongsData;
  experiences: ExperienceItem[];
  skills: string[];
  contact: ContactData;
  trash?: TrashItem[];
  backups?: BackupItem[];
}
