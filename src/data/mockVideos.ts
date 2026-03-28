///short-feed-explorer/src/data/mockVideos.ts


export interface VideoData {
  video_id: string;
  video_url: string;
  thumbnail: string;
  title: string;
  description: string;
  channel_name: string;
  profile_image: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  duration_sec: number;
  order_index: number;
}

// Placeholder colors for mock video backgrounds
const bgColors = [
  '#1a1a2e', '#16213e', '#0f3460', '#1b1b2f', '#162447',
];

export const mockVideos: VideoData[] = [
  {
    video_id: 'v1',
    video_url: '',
    thumbnail: '',
    title: 'Amazing sunset timelapse over the ocean 🌅',
    description: 'Watch this incredible sunset captured in 4K. The colors are unreal! #sunset #nature #timelapse',
    channel_name: 'NatureVibes',
    profile_image: '',
    like_count: 45200,
    comment_count: 1230,
    share_count: 890,
    duration_sec: 30,
    order_index: 0,
  },
  {
    video_id: 'v2',
    video_url: '',
    thumbnail: '',
    title: 'How to make the perfect espresso ☕',
    description: 'Step by step guide to making barista-level espresso at home #coffee #tutorial #barista',
    channel_name: 'CoffeeGuru',
    profile_image: '',
    like_count: 23100,
    comment_count: 567,
    share_count: 432,
    duration_sec: 45,
    order_index: 1,
  },
  {
    video_id: 'v3',
    video_url: '',
    thumbnail: '',
    title: 'Street dance battle in Tokyo 🇯🇵',
    description: 'Incredible street dance performance in Shibuya! These moves are insane 🔥 #dance #tokyo #streetdance',
    channel_name: 'DanceMoments',
    profile_image: '',
    like_count: 98700,
    comment_count: 3450,
    share_count: 5670,
    duration_sec: 58,
    order_index: 2,
  },
  {
    video_id: 'v4',
    video_url: '',
    thumbnail: '',
    title: 'Satisfying pottery making process 🏺',
    description: 'Watch this clay transform into a beautiful vase. So relaxing! #pottery #asmr #satisfying',
    channel_name: 'CraftedByHand',
    profile_image: '',
    like_count: 67400,
    comment_count: 2100,
    share_count: 1890,
    duration_sec: 35,
    order_index: 3,
  },
  {
    video_id: 'v5',
    video_url: '',
    thumbnail: '',
    title: 'Cat tries to catch laser pointer 😹',
    description: 'My cat went absolutely crazy chasing this laser! Watch till the end 😂 #cats #funny #pets',
    channel_name: 'PetComedy',
    profile_image: '',
    like_count: 156000,
    comment_count: 8900,
    share_count: 12300,
    duration_sec: 22,
    order_index: 4,
  },
];

export const bgColorForIndex = (i: number) => bgColors[i % bgColors.length];
