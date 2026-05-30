/** 선택지 배열에서 답 문자열을 "N. 보기내용" 형식으로 표시 */
export function formatChoiceLine(
  choices: string[],
  answer: string | null | undefined,
): string {
  if (answer === null || answer === undefined || answer === "") return "미응답";
  const idx = choices.findIndex((c) => c === answer);
  if (idx < 0) return answer;
  return `${idx + 1}. ${answer}`;
}
