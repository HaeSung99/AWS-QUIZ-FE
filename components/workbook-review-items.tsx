import { formatChoiceLine } from "@/lib/format-choice";
import type { ReviewItem } from "@/lib/api";

type WorkbookReviewItemsProps = {
  items: ReviewItem[];
  /** 문항 li에 붙일 id 접두사 (퀴즈 결과에서 번호 클릭 시 스크롤용) */
  itemIdPrefix?: string;
};

export function WorkbookReviewItems({
  items,
  itemIdPrefix = "review-item",
}: WorkbookReviewItemsProps) {
  const sorted = [...items].sort((a, b) => a.questionNumber - b.questionNumber);

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((item) => (
        <li
          key={item.questionId}
          id={`${itemIdPrefix}-${item.questionId}`}
          className="scroll-mt-4 rounded-lg border border-neutral-800/80 bg-black/40 p-3"
        >
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="tabular-nums text-neutral-500">
              문항 #{item.questionNumber}
            </span>
            <span
              className={
                item.isCorrect
                  ? "font-semibold text-emerald-400"
                  : "font-semibold text-rose-400"
              }
            >
              {item.isCorrect ? "정답" : "오답"}
            </span>
            <span className="text-neutral-600">{item.questionCategory}</span>
            <span className="text-neutral-600">· 난이도 {item.difficulty}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-100">
            {item.questionDescription}
          </p>
          <dl className="mt-3 space-y-1.5 text-[11px]">
            <div>
              <dt className="text-neutral-500">선택한 보기</dt>
              <dd className="text-neutral-200">
                {formatChoiceLine(item.choices, item.selectedAnswer)}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">정답</dt>
              <dd className="font-medium text-emerald-300">
                {formatChoiceLine(item.choices, item.correctAnswer)}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
