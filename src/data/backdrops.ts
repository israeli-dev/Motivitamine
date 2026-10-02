import summitImg from '../assets/images/backdrop_mountain_summit_1790954316069.jpg';
import studioImg from '../assets/images/backdrop_creative_studio_1790954328549.jpg';
import cosmosImg from '../assets/images/backdrop_cosmic_starlight_1790954345417.jpg';
import zenImg from '../assets/images/backdrop_zen_garden_1790954357358.jpg';
import { BackdropId } from '../types';

export interface BackdropOption {
  id: BackdropId;
  name: string;
  category: 'photographic' | 'minimalist';
  imageUrl?: string;
  gradient?: string;
  description: string;
}

export const BACKDROP_OPTIONS: BackdropOption[] = [
  {
    id: 'summit',
    name: 'Summit Dawn',
    category: 'photographic',
    imageUrl: summitImg,
    description: 'Golden hour mountain crest piercing morning fog',
  },
  {
    id: 'studio',
    name: 'Artisan Atelier',
    category: 'photographic',
    imageUrl: studioImg,
    description: 'Sun-drenched craft workshop with natural wood and light',
  },
  {
    id: 'cosmos',
    name: 'Celestial Void',
    category: 'photographic',
    imageUrl: cosmosImg,
    description: 'Deep cosmic nebula with glowing stars and stardust',
  },
  {
    id: 'zen',
    name: 'Zen Sanctuary',
    category: 'photographic',
    imageUrl: zenImg,
    description: 'Quiet moss stones and morning light reflection pool',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Minimal',
    category: 'minimalist',
    gradient: 'linear-gradient(135deg, #090d16 0%, #171d2b 50%, #0a0d14 100%)',
    description: 'Rich dark slate with subtle architectural gradient',
  },
  {
    id: 'midnight',
    name: 'Nebula Silk',
    category: 'minimalist',
    gradient: 'radial-gradient(ellipse at top left, #1e1b4b 0%, #0f172a 50%, #020617 100%)',
    description: 'Deep midnight indigo with delicate cosmic glow',
  },
];
