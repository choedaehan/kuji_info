export const KUJI_GRADE_OPTIONS = [
  'A상',
  'B상',
  'C상',
  'D상',
  'E상',
  'F상',
  'G상',
  'H상',
  'I상',
  'J상',
  'K상',
  'L상',
  '라스트원상',
];

type KujiLineupLabelInput = {
  prizeName: string | null;
  prizeType?: string | null;
  grade: string | null;
  quantity: number | null;
  goods?: {
    name: string;
  } | null;
};

export function formatKujiLineupLabel(lineup: KujiLineupLabelInput) {
  const grade = lineup.grade || '-';
  const prizeType = lineup.prizeType || '-';
  const prizeName = lineup.prizeName || lineup.goods?.name || '-';
  const quantity = lineup.quantity ?? '-';
  const status = lineup.goods ? ` / 연결됨: ${lineup.goods.name}` : '';

  return `${grade} / ${prizeType} / ${prizeName} / 수량 ${quantity}${status}`;
}
