import type { Metadata } from "next";
import { PrivacyWrapper } from "./Privacy.styled";

export const metadata: Metadata = {
    title: "개인정보 처리방침",
    description: "이 블로그가 저장하는 정보와 그 이유",
    alternates: { canonical: "/privacy" },
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
            <p className="updated">최종 수정: 2026년 10월 30일</p>

            <p className="lead">
                개인이 운영하는 기술 블로그입니다. 로그인·댓글에 필요한 정보와 방문 통계를
                아래와 같이 처리합니다.
            </p>

            <h2>1. 로그인할 때</h2>
            <p>
                댓글을 남기려면 GitHub 또는 Google 계정으로 로그인해야 합니다. 이때 해당 서비스가
                알려주는 정보 중 다음을 저장합니다.
            </p>
            <ul>
                <li>사용자명(GitHub) 또는 이름(Google)과 프로필 이미지 주소 — 댓글에 작성자를 표시하기 위해</li>
                <li>계정 식별자 — 같은 사람이 다시 로그인했을 때 알아보기 위해</li>
                <li>이메일 주소 — 로그인 처리를 맡은 Supabase Auth 가 계정을 구분하기 위해 저장합니다. 화면에 표시하거나 다른 용도로 쓰지 않습니다.</li>
            </ul>
            <p>
                비밀번호, 저장소 목록 같은 것은 받지도 저장하지도 않습니다.
                로그인 자체는 Supabase Auth 가 처리하며, 비밀번호는 이 사이트를 거치지 않습니다.
            </p>

            <h2>2. 댓글</h2>
            <p>
                작성한 내용과 시각이 저장됩니다. 댓글을 지우면 본문과 작성자 표시는 사라지고
                &ldquo;삭제된 댓글입니다&rdquo; 자리만 남습니다. 달려 있던 답글이 함께
                사라지지 않게 하기 위해서입니다.
            </p>

            <h2>3. 방문 통계와 유입 분석</h2>
            <p>
                블로그에 표시하는 방문자 수와 글 조회수는 자체 집계합니다.
                자체 데이터베이스에는 날짜별 방문자 수와 글별 조회수만 저장하며,
                방문자를 계정과 연결하지 않습니다.
            </p>
            <p>
                자체 집계에서는 IP 주소를 데이터베이스에 저장하지 않습니다.
                과도한 요청을 제한하기 위해 서버 메모리에서 일시적으로 사용하며,
                브라우저 정보(User-Agent)는 검색 엔진 로봇을 걸러내는 데 사용합니다.
            </p>
            <p>
                어떤 글에 어디서 방문했는지 파악하기 위해 <strong>Vercel Web Analytics</strong>도
                사용합니다. 공개 페이지의 조회와 유입 출처, 국가, 기기·브라우저·운영체제 정보를
                Vercel이 처리하고, 운영자는 집계된 통계를 확인합니다. 이 분석 도구는 쿠키를
                사용하지 않으며 로그인 계정 정보나 댓글 본문을 보내지 않습니다.
            </p>
            <p>
                관리자·로그인·인증 경로는 분석 대상에서 제외합니다. 분석에 보내는 페이지 URL에서
                검색어 등의 쿼리 값과 해시를 제거합니다. 자세한 처리 방식은{" "}
                <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">
                    Vercel Web Analytics 개인정보 안내
                </a>
                에서 확인할 수 있습니다.
            </p>

            <h2>4. 쿠키와 브라우저 저장소</h2>
            <p>쿠키는 세 가지를 씁니다. 광고나 추적을 위한 쿠키는 없습니다.</p>
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
            <p>
                쿠키와 별개로, 화면 설정을 기억하려고 브라우저 저장소에 아래 값을 둡니다.
                이 값들은 브라우저 안에만 있고 서버로 보내지 않습니다.
            </p>
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
                                <code>theme</code>
                            </td>
                            <td>고른 화면 테마(라이트·다크·시스템)를 기억</td>
                            <td>브라우저 데이터를 지울 때까지</td>
                        </tr>
                        <tr>
                            <td>
                                <code>recentPosts</code>
                            </td>
                            <td>사이드 메뉴의 &ldquo;최근 본 글&rdquo; (글 주소 최대 5개)</td>
                            <td>브라우저 데이터를 지울 때까지</td>
                        </tr>
                        <tr>
                            <td>
                                <code>admin-list-url:…</code>
                            </td>
                            <td>관리 화면에서 탭마다 마지막으로 보던 목록 조건 (관리자만)</td>
                            <td>브라우저 탭을 닫을 때까지</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2>5. 어디에 저장되나</h2>
            <p>
                데이터베이스와 로그인은 <strong>Supabase</strong>(서울 리전), 사이트 호스팅과
                유입 분석은 <strong>Vercel</strong>을 씁니다. 서버 함수는 서울 리전에서 실행하며,
                분석 데이터 처리 위치가 서버 함수의 리전과 같다는 뜻은 아닙니다.
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
