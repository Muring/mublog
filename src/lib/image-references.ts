/** 본문·썸네일 URL에서 Storage 객체 경로만 추출한다. 잘못된 인코딩은 정리를 중단시킨다. */
export function referencedImagePaths(text: string, bucket: string): string[] {
    const prefix = `/storage/v1/object/public/${bucket}/`;
    const paths: string[] = [];
    for (const remainder of text.split(prefix).slice(1)) {
        // 마크다운 링크의 닫는 괄호는 경로에서 제외한다. 파일명의 괄호는 %28/%29로 인코딩된다.
        const url = new URL(prefix + remainder.split(/[)\s"'<>]/)[0], "https://storage.invalid");
        paths.push(decodeURIComponent(url.pathname.slice(prefix.length)));
    }
    return paths;
}
