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
  "AWS Quiz KR | AWS 자격증 SAA·CLF 퀴즈·문제집 (한국어)";

export const SITE_DEFAULT_DESCRIPTION =
  "AWS 자격증(SAA-C03, CLF-C02 등) 준비용 한국어 퀴즈·문제집 서비스입니다. " +
  "Solutions Architect·Cloud Practitioner 시험 범위를 바탕으로 한 객관식 문제로 실전 감각을 익히고, " +
  "문제집별 정답률·풀이 완료를 확인할 수 있습니다. " +
  "AWS 문제·SAA·CLF 퀴즈·시험 준비·연습문제·모의고사를 찾는 분께 도움이 되도록 구성했습니다. " +
  "실제 시험 덤프를 제공하지 않으며, 이해·연습 목적의 자체 학습용 문항을 제공합니다.";

/** Open Graph·Twitter 카드 등 공유 이미지용 대체 텍스트 */
export const SITE_OG_IMAGE_ALT =
  "AWS Quiz KR 로고 — AWS 자격증 SAA·CLF 한국어 퀴즈·문제집 서비스";

/**
 * 스크린 리더 전용(sr-only) 보충 서술. 시각적으로는 숨기고 접근성·색인 보조에 활용합니다.
 * 검색 표기(aws saa, AWS 덤프 등)는 메타 키워드·본 서술과 함께 쓰입니다.
 */
export const SITE_SCREEN_READER_SEO_NARRATION =
  "보충 안내. 이 페이지는 AWS Quiz KR의 메인 학습 화면입니다. " +
  "aws saa, AWS SAA, aws Saa처럼 표기만 다른 검색어도 같은 사이트를 가리킵니다. " +
  "AWS 덤프·aws 덤프·saa 덤프 또는 영문 aws dump로 찾아오신 경우에도, 여기서는 시험 범위에 맞춘 예상문제 형태의 한국어 문제집·퀴즈를 제공하며, 공식 시험 원문 복제가 아닌 자체 작성 학습 문항입니다. " +
  "SAA-C03, CLF-C02 문제집 풀이, 오늘의 문제, 약점 유형·유사 문제 추천을 이용할 수 있습니다.";
