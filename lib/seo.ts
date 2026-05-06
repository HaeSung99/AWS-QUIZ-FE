/** 프로덕션 도메인 (metadataBase, canonical, JSON-LD 공통) */
export const SITE_ORIGIN = "https://awsquizkr.com";

/** 검색·SNS용 키워드 (메타 참고용. 구글은 keywords 메타 가중치 낮음 → 본문·제목이 더 중요) */
export const SITE_KEYWORDS: string[] = [
  "AWS Quiz KR",
  "awsquizkr",
  "AWS 퀴즈",
  "AWS 문풀",
  "AWS 자격증",
  "AWS 문제",
  "AWS 시험",
  "AWS 연습문제",
  "AWS SAA",
  "aws saa",
  "AWS SAA-C03",
  "SAA-C03",
  "SAA 퀴즈",
  "SAA 준비",
  "saa 덤프",
  "SAA 덤프",
  "aws 덤프",
  "AWS 덤프",
  "예상문제",
  "예상문제 덤프",
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
  "saa 문제",
  "AWS 아키텍트",
];

export const SITE_DEFAULT_TITLE =
  "AWS Quiz KR | AWS 자격증 SAA·CLF 퀴즈·문제집 (한국어·aws saa 연습)";

export const SITE_DEFAULT_DESCRIPTION =
  "AWS 자격증(SAA-C03, CLF-C02 등) 준비용 한국어 퀴즈·문제집입니다. " +
  "\"aws saa\", \"AWS SAA\", \"saa 덤프\", \"aws 덤프\"처럼 검색하셔도 같은 서비스입니다—여기서 말하는 덤프는 " +
  "실제 시험 원문을 그대로 가져온 것이 아니라, 시험 범위에 맞춰 자체 제작·축적한 예상문제 묶음(문제집)입니다. " +
  "AWS 자격증의 다양한 유형을 객관식으로 연습하고, 문제집별 정답률·풀이 완료·약점 연습을 지원합니다.";

/** 홈 FAQ 본문 + FAQPage JSON-LD에 동일 사용 (검색 스니펫·키워드 자연 노출) */
export const SITE_FAQ_ITEMS: readonly { question: string; answer: string }[] =
  [
    {
      question: "여기서 말하는 AWS 덤프·SAA 덤프는 무엇인가요?",
      answer:
        "실제 시험 문항을 유출·복제한 자료가 아니라, 출제 범위와 유형을 참고해 자체적으로 만든 예상문제를 문제집 형태로 쌓아 둔 학습용 묶음을 말합니다. 업계에서 통상 ‘덤프’라 부르는 예상문제 모음에 가깝습니다.",
    },
    {
      question: "\"aws saa\" 또는 \"AWS SAA\" 연습은 어디서 하나요?",
      answer:
        "홈에서 목표 자격증에 맞는 문제집을 고르거나 오늘의 문제·유형별 연습으로 풀 수 있습니다. SAA-C03(Solutions Architect Associate) 중심 문제집과 가이드(/guide/saa-c03)를 함께 제공합니다.",
    },
    {
      question: "\"saa 덤프\", \"aws 덤프\"로 검색했을 때 이 사이트에서 할 수 있는 것은?",
      answer:
        "한국어 객관식 예상문제 덤프(문제집)로 연습하고, 채점·풀이 기록을 남기며 약점 유형·유사 문제 추천까지 이어가는 것입니다. 공식 시험 기출 원문과 동일하지 않으며, 자체 작성 문항입니다.",
    },
  ];
