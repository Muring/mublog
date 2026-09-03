import type { Metadata } from "next";
import { PrivacyWrapper } from "./Privacy.styled";

export const metadata: Metadata = {
    title: "개인정보 처리방침",
    description: "이 블로그가 저장하는 정보와 그 이유",
};

/**
 * 개인정보 처리방침.
 *
 * 실제로 저장하는 것만 적는다. 안 하는 일을 길게 나열하는 문서가 아니라,
 * 무엇이 어디에 남는지 읽는 사람이 확인할 수 있게 하는 것이 목적이다.
 * 내용을 바꿀 때는 코드가 아니라 이 문서가 따라와야 한다 —
 * 저장 항목이 늘면 여기 표에도 줄이 늘어야 한다.
 */
export default function PrivacyPage() {
    return (
        <PrivacyWrapper>
            <h1>개인정보 처리방침</h1>
            <p className="updated">최종 수정: 2026년 9월 3일</p>

            <p className="lead">
                개인이 운영하는 기술 블로그입니다. 광고도, 외부 분석 도구도 붙이지 않았습니다.
                아래에 적은 것이 이 사이트가 저장하는 전부입니다.
            </p>

            <h2>1. 로그인할 때</h2>
            <p>
                댓글을 남기려면 GitHub 계정으로 로그인해야 합니다. 이때 GitHub 이 알려주는
                정보 중 다음을 저장합니다.
            </p>
            <ul>
                <li>GitHub 사용자명과 프로필 이미지 주소 — 댓글에 작성자를 표시하기 위해</li>
                <li>GitHub 계정 식별자 — 같은 사람이 다시 로그인했을 때 알아보기 위해</li>
            </ul>
            <p>
                이메일 주소, 비밀번호, 저장소 목록 같은 것은 받지도 저장하지도 않습니다.
                로그인 자체는 Supabase Auth 가 처리하며, 비밀번호는 이 사이트를 거치지 않습니다.
            </p>

            <h2>2. 댓글</h2>
            <p>
                작성한 내용과 시각이 저장됩니다. 댓글을 지우면 본문과 작성자 표시는 사라지고
                &ldquo;삭제된 댓글입니다&rdquo; 자리만 남습니다. 달려 있던 답글이 함께
                사라지지 않게 하기 위해서입니다.
            </p>

            <h2>3. 방문자 수</h2>
            <p>
                하루에 몇 명이 다녀갔는지, 각 글이 몇 번 읽혔는지만 셉니다.{" "}
                <strong>누가 왔는지는 저장하지 않습니다.</strong> 남는 것은 날짜와 숫자뿐입니다.
            </p>
            <p>
                IP 주소를 저장하지 않고, 접속 기록을 방문자별로 쌓지도 않습니다.
                브라우저 정보(User-Agent)는 검색 엔진 로봇을 걸러내는 데 한 번 읽고 버립니다.
            </p>

            <h2>4. 쿠키</h2>
            <p>세 가지를 씁니다. 광고나 추적을 위한 쿠키는 없습니다.</p>
            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>하는 일</th>
                            <th>남는 기간</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <code>mublog_seen</code>
                            </td>
                            <td>같은 사람을 하루에 한 번만 세기 위해</td>
                            <td>그날 자정까지</td>
                        </tr>
                        <tr>
                            <td>
                                <code>mublog_p_…</code>
                            </td>
                            <td>새로고침으로 조회수가 부풀지 않게</td>
                            <td>30분</td>
                        </tr>
                        <tr>
                            <td>
                                <code>sb-…</code>
                            </td>
                            <td>로그인 상태 유지 (Supabase Auth)</td>
                            <td>로그아웃할 때까지</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>
                앞의 두 개는 숫자를 정확히 세기 위한 것이고 개인을 식별하지 않습니다.
                마지막 하나는 로그인 기능 자체에 필요합니다. 그래서 따로 동의를 묻는 배너를
                두지 않았습니다.
            </p>

            <h2>5. 어디에 저장되나</h2>
            <p>
                데이터베이스와 로그인은 <strong>Supabase</strong>(서울 리전), 사이트 호스팅은{" "}
                <strong>Vercel</strong>(서울 리전)을 씁니다. 두 곳 외에 정보를 넘기는 곳은
                없습니다.
            </p>

            <h2>6. 지우고 싶다면</h2>
            <p>
                댓글은 직접 지울 수 있습니다. 계정과 남은 기록까지 모두 지우고 싶다면{" "}
                <a href="https://github.com/Muring" target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>
                으로 알려주세요. 확인 후 지우고 회신하겠습니다.
            </p>
        </PrivacyWrapper>
    );
}
