// src/data/mockVideos.ts

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
  '#1a1a2e',
  '#16213e',
  '#0f3460',
  '#1b1b2f',
  '#162447',
];

type VideoMeta = {
  thumbnail: string;
  title: string;
  description: string;
  channel_name: string;
  profile_image: string;
};

// 여기에서 description, channel_name 등을 영상별로 수정하시면 됩니다.
const customMetadata: Record<number, Partial<VideoMeta>> = {
  1: {
    description: '고양이가 스라소니를 구했습니다... 몇 년 후, 스라소니가 돌아왔습니다.',
    channel_name: '놀란사실.2',
  },
  2: {
    description: '이수근: 코미디언이 새벽에 수영장 가요?',
    channel_name: 'esports',
  },
  3: {
    description: '동기지만 배우 서열은 다르지~',
    channel_name: 'tvNJoy',
  },
  4: {
    description: '"넌 왜 세금 많이 내냐" 연예인 잘 몰랐던 김선영🤣 | 라디오스타 | TVPP | MBC 161214 방송',
    channel_name: 'TVPeople',
  },
  5: {
    description: '홀린듯이 보게 되는 고민시 #런닝맨',
    channel_name: 'BBACKENT',
  },

  // 6번부터 50번까지는 아래처럼 필요할 때 추가로 수정하면 됩니다.
  // 6: {
  //   description: '6번 영상 설명',
  //   channel_name: '채널명',
  // },
};

// 정수 난수 생성 함수
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 실제 영상 길이 가져오기
const getVideoDuration = (videoUrl: string): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');

    video.preload = 'metadata';
    video.src = videoUrl;

    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration);
      resolve(duration);
    };

    video.onerror = () => {
      console.warn(`영상 길이를 불러오지 못했습니다: ${videoUrl}`);
      resolve(0);
    };
  });
};

// 기본 메타데이터 생성
const createBaseMetadata = (index: number): VideoMeta => {
  const videoNumber = index + 1;

  return {
    thumbnail: '',
    title: '',
    description: `저를 바꿔주세요 ${videoNumber}`,
    channel_name: '저를 바꿔주세요',
    profile_image: '',
    ...customMetadata[videoNumber],
  };
};

// duration_sec을 제외한 기본 mockVideos
export const mockVideos: VideoData[] = Array.from({ length: 50 }, (_, index) => {
  const videoNumber = index + 1;
  const metadata = createBaseMetadata(index);

  return {
    video_id: `video-${String(videoNumber).padStart(2, '0')}`,
    video_url: `/v${videoNumber}.mp4`,
    thumbnail: metadata.thumbnail,
    title: metadata.title,
    description: metadata.description,
    channel_name: metadata.channel_name,
    profile_image: metadata.profile_image,

    // 난수 자동 생성
    like_count: randomInt(1000, 200000),
    comment_count: randomInt(100, 10000),
    share_count: randomInt(50, 15000),

    // 실제 영상 길이는 loadMockVideos()에서 업데이트됨
    duration_sec: 0,

    order_index: index,
  };
});

// 실제 duration_sec까지 반영된 최종 영상 데이터 로드 함수
export const loadMockVideos = async (): Promise<VideoData[]> => {
  const videosWithDurations = await Promise.all(
    mockVideos.map(async (video) => {
      const duration = await getVideoDuration(video.video_url);

      return {
        ...video,
        duration_sec: duration,
      };
    })
  );

  return videosWithDurations;
};

export const bgColorForIndex = (i: number) => bgColors[i % bgColors.length];