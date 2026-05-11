/** 프로덕션 도메인 (metadataBase, canonical, JSON-LD 공통) */
export const SITE_ORIGIN = "https://awsquizkr.com";

/**
 * 검색어 대소문자·표기 차이를 줄이기 위한 보조 구문 (메타 keywords·JSON-LD alternateName 등).
 */
export const SITE_SEARCH_PHRASE_VARIANTS: readonly string[] = [
  // AWS + SAA
  "aws saa",
  "AWS saa",
  "aws SAA",
  "AWS SAA",
  // 덤프 (한글)
  "aws 덤프",
  "AWS 덤프",
  "saa 덤프",
  "aws saa 덤프",
  "AWS SAA 덤프",
  // 영문 검색 혼용
  "aws dump",
  "AWS dump",
  "saa dump",
  // 자격·시험 코드
  "saa-c03",
  "SAA-C03",
  "AWS saa-c03",
  "aws saa-c03",
  // CLF
  "aws clf",
  "AWS clf",
  "AWS CLF",
  "clf-c02",
  "CLF-C02",
  "예상문제 덤프",
  "예상문제",
];

/** 검색·SNS용 키워드 (메타 keywords, 문단에 자연스럽게 녹일 때 참고) */
export const SITE_KEYWORDS: string[] = [
  ...SITE_SEARCH_PHRASE_VARIANTS,
  "AWS Quiz KR",
  "awsquizkr",
  "AWS 퀴즈",
  "AWS 문풀",
  "AWS 자격증",
  "AWS 문제",
  "AWS 시험",
  "AWS 연습문제",
  "AWS SAA-C03",
  "SAA 퀴즈",
  "SAA 준비",
  "Solutions Architect Associate",
  "AWS CLF",
  "AWS CLF-C02",
  "CLF-C02",
  "Cloud Practitioner",
  "클라우드 자격증",
  "AWS 한국어",
  "AWS 공인",
  "AWS 시험 준비",
  "AWS 모의고사",
  "AWS SAA 퀴즈",
  "AWS SAA 준비",
  "AWS 시험 대비",
  "AWS 문제집",
  "AWS 기출 스타일",
];

export const SITE_DEFAULT_TITLE =
  "AWS Quiz KR | AWS 자격증 SAA·CLF 한국어 퀴즈·문제집";

export const SITE_DEFAULT_DESCRIPTION =
  "AWS 자격증(SAA-C03, CLF-C02 등)과 Solutions Architect·Cloud Practitioner 준비를 위한 한국어 문제집입니다. " +
  "시험 가이드 범위에 맞춰 제작한 AWS 덤프 형식의 연습문제를 풀며 준비할 수 있고, 풀이 기록·유사 문제 추천·약점 분석을 제공합니다. " +
  "실제 시험 공식 문항이나 정답은 포함하지 않고, 시험에 도움이 되도록 자체 작성한 예상문제입니다.";

/** 메인 히어로 첫 문단 (대문) */
export const SITE_HOME_HERO_LEDE =
  "AWS 자격증 시험 기준에 맞춰 제작한 AWS 덤프 형식의 한국어 문제를 풀어 보며 SAA·Cloud Practitioner 등 자격증 준비를 이어 가 보세요. " +
  "풀이 기록을 바탕으로 한 유사 문제 추천과 AI 약점 코멘트까지 한 화면에서 확인할 수 있습니다.";

/** 메인 하단 고지 (유출·공식 문항 아님) */
export const SITE_HOME_CONTENT_NOTICE =
  "AWS Quiz KR의 문제와 해설에는 실제 AWS 자격증 시험에 출제된 공식 문항이나 그 정답이 포함되어 있지 않습니다. " +
  "시험 가이드 범위와 학습에 참고할 수 있는 내용을 바탕으로, 시험 준비에 도움이 되도록 자체 제작한 연습·예상문제입니다.";

/** Open Graph·Twitter 카드 등 공유 이미지용 대체 텍스트 */
export const SITE_OG_IMAGE_ALT =
  "AWS Quiz KR 로고 — AWS 자격증 SAA·CLF 한국어 퀴즈·문제집 서비스";

/**
 * 스크린 리더 전용(sr-only) 보충 서술. 시각적으로는 숨기고 접근성·색인 보조에 활용합니다.
 * 검색 표기(aws saa, AWS 덤프 등)는 메타 키워드·본 서술과 함께 쓰입니다.
 */
export const SITE_SCREEN_READER_SEO_NARRATION =
  "메인 학습 화면입니다. 시험 가이드에 맞춘 자체 제작 덤프 형식 연습문항이며, 하단 안내처럼 공식 시험 원문·정답은 포함하지 않습니다. " +
  "오늘의 문제, 약점 분석, 문제집 목록을 이용할 수 있습니다.";
