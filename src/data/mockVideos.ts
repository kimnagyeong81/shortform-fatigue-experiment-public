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
    description: '비서와 부장님의 위험한 야근 1화 #과일AI #과일드라마 #fruit #aivideo #shorts',
    channel_name: 'BBACKENT',
  },
  6: {
    description: '눈찢기 인종차별 멕시코 남성 사과 _진심 후회_ #월드컵 #인종차별 #멕시코',
    channel_name: 'BBACKENT',
  },
  7: {
    description: '선넘은 장난을 친 친구의 최후',
    channel_name: 'BBACKENT',
  },
  8: {
    description: '황희찬이 아무도 없는 공간에 크로스를 올린 이유 #축구소식 #해외축구 #해외축구소식 #경기결과 #축구정보',
    channel_name: 'BBACKENT',
  },
  9: {
    description: '왁뿌볼 asmr #왁뿌볼 #asmr #말랑이',
    channel_name: 'BBACKENT',
  },
  10: {
    description: '여자들은 한번쯤은 느껴봤던 감정',
    channel_name: 'BBACKENT',
  },
  11: {
    description: '장원영 인성, 욕설',
    channel_name: 'BBACKENT',
  },
  12: {
    description: 'AI: 당연히 돈 많은 재석이 형이 내야지_놀면뭐하니_TVPP_MBC 250816 방송',
    channel_name: 'BBACKENT',
  },
  13: {
    description: '이게 우연이라고?',
    channel_name: 'BBACKENT',
  },
  14: {
    description: '명령하지마라',
    channel_name: 'BBACKENT',
  },
  15: {
    description: '여자들 난리날것같은 하트모양 핸드폰 갤럭시 vs 아이폰',
    channel_name: 'BBACKENT',
  },
  16: {
    description: '수달은 사실 물이 무섭습니다..#fyp',
    channel_name: 'BBACKENT',
  },
  17: {
    description: '대한민국 화이팅🔥#korea #월드컵 #화이팅 #챌린지 #추천',
    channel_name: 'BBACKENT',
  },
  18: {
    description: '장난이였어요..#Shorts #장난 #왕따',
    channel_name: 'BBACKENT',
  },
  19: {
    description: '다이소 만두 말랑이',
    channel_name: 'BBACKENT',
  },
  20: {
    description: '#개그콘서트 #fyp #Gagconcert #kbs',
    channel_name: 'BBACKENT',
  },
  21: {
    description: '노래시작해따 노래끝나따 #아무개란',
    channel_name: 'BBACKENT',
  },
  22: {
    description: '2026년 밈 몇개 아세요_ ㅋㅋ',
    channel_name: 'BBACKENT',
  },
  23: {
    description: '와장창 #헬스 #운동 #수박 #watermelon #crush ',
    channel_name: 'BBACKENT',
  },
  24: {
    description: '이이경 추가폭로 나왔다 ㄷㄷ',
    channel_name: 'BBACKENT',
  },
  25: {
    description: '웃는 얼굴로 사람 패는 중 #런닝맨 #runningman #SBS #예능 #빽능',
    channel_name: 'BBACKENT',
  },
  26: {
    description: '할머니와 짜장면 한그릇 #쇼츠 #드라마 #drama #스케치코미디 #유머 #할머니',
    channel_name: 'BBACKENT',
  },
  27: {
    description: '몰상식',
    channel_name: 'BBACKENT',
  },
  28: {
    description: '조정석 웃다 쓰러지는 윤경호 알바썰',
    channel_name: 'BBACKENT',
  },
  29: {
    description: '리액션이 너무 좋은 차지연 #라디오스타',
    channel_name: 'BBACKENT',
  },
  30: {
    description: '왁뿌볼 소금빵 #mukbang',
    channel_name: 'BBACKENT',
  },
  31: {
    description: '짭새들이 같이 라이딩 가자고 따라와요 ㅠ ',
    channel_name: 'BBACKENT',
  },
  32: {
    description: '인스타 릴스 260만 뷰 괌 우정여행 그영상 🏝️💙',
    channel_name: 'BBACKENT',
  },
  33: {
    description: '요즘 시대에 필요하다는 선생님 🤣',
    channel_name: 'BBACKENT',
  },
  34: {
    description: '장원영 인성 실화야__',
    channel_name: 'BBACKENT',
  },
  35: {
    description: '군인들의 애국심과 자긍심을 높이는 꿀팁',
    channel_name: 'BBACKENT',
  },
  36: {
    description: '손흥민이 침투하는 케인을 무시하는 듯한 이유 #축구소식 #해외축구 #해외축구소식 #경기결과 #축구정보',
    channel_name: 'BBACKENT',
  },
  37: {
    description: '이광수 성대 파괴쇼ㅋㅋ 멤버들 초토화 #런닝맨 #runningman #SBS #예능 #빽능',
    channel_name: 'BBACKENT',
  },
  38: {
    description: '천만명을 웃기고 울린 통화내용들 웃긴만화, 웃긴영상! 웹툰!',
    channel_name: 'BBACKENT',
  },
  39: {
    description: '억지 유행의 뒤를 잇는 또 다른 유행 음식',
    channel_name: 'BBACKENT',
  },
  40: {
    description: 'Radish #RunningMan #JiYeeun #SBSRunningMan #RunningManClip',
    channel_name: 'BBACKENT',
  },
  41: {
    description: '난 가끔 춤을 추고 싶어',
    channel_name: 'BBACKENT',
  },
  42: {
    description: '홀린듯이 보게 되는 고민시 #런닝맨',
    channel_name: 'BBACKENT',
  },

  43: {
    description: '요즘 한국 인터넷 유행 특징',
    channel_name: 'BBACKENT',
  },

  44: {
    description: '학폭 트라우마가 평생 가는 이유',
    channel_name: 'BBACKENT',
  },
  45: {
    description: '언발란스 내꺼야 #허경환 #놀면뭐하니',
    channel_name: 'BBACKENT',
  },
  46: {
    description: 'Us_cats kittens us couple #cute ',
    channel_name: 'BBACKENT',
  },
  47: {
    description: '3살 아이 덮치는 원숭이, 아슬하게 막아낸 고양이 그 소름돋는 순간 #감동 #가족  #고양이 #반려동물',
    channel_name: 'BBACKENT',
  },


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
