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
    video_id: '59e1224b-a56a-4ed4-989e-db56ae5a179f',
    video_url: '/public/v1.mp4',
    thumbnail: '',
    title: '',
    description: '고양이가 스라소니를 구했습니다... 몇 년 후, 스라소니가 돌아왔습니다.',
    channel_name: '놀란사실.2',
    profile_image: '',
    like_count: 45200,
    comment_count: 1230,
    share_count: 890,
    duration_sec: 30,
    order_index: 0,
  },
  {
    video_id: '4258aee8-d89b-4624-a5ec-c8d64a4f1dd7',
    video_url: '/public/v2.mp4',
    thumbnail: '',
    title: '',
    description: '이수근: 코미디언이 새벽에 수영장 가요?',
    channel_name: 'esports',
    profile_image: '',
    like_count: 23100,
    comment_count: 567,
    share_count: 432,
    duration_sec: 45,
    order_index: 1,
  },
  {
    video_id: 'ce057e56-d831-4d28-96a6-37076b2bcc42',
    video_url: '/public/v3.mp4',
    thumbnail: '',
    title: '',
    description: '동기지만 배우 서열은 다르지~',
    channel_name: 'tvNJoy',
    profile_image: '',
    like_count: 98700,
    comment_count: 3450,
    share_count: 5670,
    duration_sec: 58,
    order_index: 2,
  },
  {
    video_id: '5d57ddfa-ad46-4bde-a868-b78a56344735',
    video_url: '/public/v4.mp4',
    thumbnail: '',
    title: '',
    description: '"넌 왜 세금 많이 내냐" 연예인 잘 몰랐던 김선영🤣 | 라디오스타 | TVPP | MBC 161214 방송',
    channel_name: 'TVPeople',
    profile_image: '',
    like_count: 67400,
    comment_count: 2100,
    share_count: 1890,
    duration_sec: 35,
    order_index: 3,
  },
  {
    video_id: '6d89e998-c63b-4b18-be91-ad1afbe5377f',
    video_url: '/public/v5.mp4',
    thumbnail: '',
    title: '',
    description: '홀린듯이 보게 되는 고민시 #런닝맨',
    channel_name: 'BBACKENT',
    profile_image: '',
    like_count: 156000,
    comment_count: 8900,
    share_count: 12300,
    duration_sec: 22,
    order_index: 4,
  },
];

export const bgColorForIndex = (i: number) => bgColors[i % bgColors.length];
