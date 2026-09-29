/**
 * 본문·썸네일 URL에서 Storage 객체 경로만 추출한다. 잘못된 인코딩은 정리를 중단시킨다.
 *
 * 공개 주소(`/object/public/`)만 보지 않는다. 변환 주소(`/render/image/public/`)나
 * 서명 주소(`/object/sign/`)를 손으로 붙여 넣은 글도 그 파일을 쓰고 있는 것이다.
 * 이 결과로 삭제를 판정하므로 애매하면 "쓰는 중" 쪽으로 넓게 잡는다.
 */
export function referencedImagePaths(text: string, bucket: string): string[] {
    const escaped = bucket.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefix = new RegExp(`/storage/v1/(?:object|render/image)/(?:public|sign|authenticated)/${escaped}/`);
    const paths: string[] = [];
    for (const remainder of text.split(prefix).slice(1)) {
        // 마크다운 링크의 닫는 괄호는 경로에서 제외한다. 파일명의 괄호는 %28/%29로 인코딩된다.
        const url = new URL("/" + remainder.split(/[)\s"'<>]/)[0], "https://storage.invalid");
        paths.push(decodeURIComponent(url.pathname.slice(1)));
    }
    return paths;
}
