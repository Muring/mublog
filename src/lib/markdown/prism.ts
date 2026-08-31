// refractor 언어 명시 등록.
//
// rehype-prism-plus 의 기본 export 는 refractor 전체 번들(400개 문법)을 끌어온다.
// contentlayer 가 그 경로를 썼기에 지금까지의 하이라이팅은 전체 번들 기준이다.
// 여기서는 실제로 쓰는 문법만 등록해 번들을 묶되, 출력은 전체 번들과 동일하게 맞춘다.
// (`/common` 번들은 jsx/tsx 가 없어서 쓸 수 없다. ignoreMissing 이 오류를 삼키므로
//  색만 조용히 빠지는 형태로 회귀한다.)
//
// ★ 등록 순서가 결과를 바꾼다.
//   - 베이스 먼저: clike -> javascript -> jsx, typescript -> tsx
//   - js-extras 는 반드시 javascript 직후, jsx/tsx "앞"에 둔다.
//     jsx/tsx 는 등록 시점의 javascript 정의를 복사해 가므로,
//     extras 를 뒤에 넣으면 javascript 에만 반영되고 jsx/tsx 에는 빠진다.
//     포스트 코드블록은 대부분 jsx 라서 이 경우 method/property-access/arrow 가
//     전부 사라지고 그만큼 function 으로 잡혀 색이 달라진다.
import { refractor } from "refractor/lib/core.js";
import markup from "refractor/lang/markup.js";
import css from "refractor/lang/css.js";
import cssExtras from "refractor/lang/css-extras.js";
import clike from "refractor/lang/clike.js";
import javascript from "refractor/lang/javascript.js";
import jsExtras from "refractor/lang/js-extras.js";
import jsx from "refractor/lang/jsx.js";
import typescript from "refractor/lang/typescript.js";
import tsx from "refractor/lang/tsx.js";
import bash from "refractor/lang/bash.js";
import yaml from "refractor/lang/yaml.js";
import sql from "refractor/lang/sql.js";
import json from "refractor/lang/json.js";
import diff from "refractor/lang/diff.js";
import apex from "refractor/lang/apex.js";
import docker from "refractor/lang/docker.js";

const languages = [
    markup,
    css,
    cssExtras,
    clike,
    javascript,
    jsExtras, // jsx/tsx 보다 반드시 앞
    jsx,
    typescript,
    tsx,
    bash,
    yaml,
    sql,
    json,
    diff,
    apex,
    docker,
];

languages.forEach((language) => refractor.register(language));

export { refractor };
