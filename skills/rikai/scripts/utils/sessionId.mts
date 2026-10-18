export const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * 引数の session_id を検証して返す。
 *
 * @param raw - コマンドライン引数の session_id
 * @returns 検証済みの session_id
 * @throws 未指定、または英数字・ハイフン・アンダースコア以外を含むとき
 */
export const parseSessionId = (raw: string | undefined): string => {
  if (raw === undefined || !SESSION_ID_PATTERN.test(raw)) {
    throw new Error(
      `session_id は英数字・ハイフン・アンダースコアのみ指定できます: "${raw ?? ""}"`,
    );
  }
  return raw;
};
