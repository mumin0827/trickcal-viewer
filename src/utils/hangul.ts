// ✅ 초성 검색 유틸
export function matchHangul(text: string, query: string): boolean {
    if (!query) return true;
    
    // 초성 리스트
    const CHOSUNG = [
        "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", 
        "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
    ];

    // 한글 여부 체크 (가 ~ 힣)
    function isHangul(char: string) {
        const code = char.charCodeAt(0);
        return code >= 0xAC00 && code <= 0xD7A3;
    }

    // 초성 추출
    function getChosung(char: string) {
        if (!isHangul(char)) return char; // 한글 아니면 그대로
        const code = char.charCodeAt(0) - 0xAC00;
        const chosungIndex = Math.floor(code / 28 / 21);
        return CHOSUNG[chosungIndex] || char;
    }

    // 문자열 -> 초성 문자열 변환
    function toChosungString(str: string) {
        return str.split("").map(getChosung).join("");
    }

    // 쿼리에 초성이 하나라도 포함되어 있는지 확인
    const isChosungQuery = query.split("").every(q => CHOSUNG.includes(q));

    if (isChosungQuery) {
        // 초성 검색 모드
        return toChosungString(text).includes(query);
    } else {
        // 일반 포함 검색
        return text.includes(query);
    }
}
