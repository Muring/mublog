import type { Syntax } from "refractor";

/** 사용 중인 refractor에는 Prisma 문법이 없어 스키마의 기본 표기를 등록한다. */
export const prismaGrammar: Syntax = Object.assign((prism: Parameters<Syntax>[0]) => {
    prism.languages.prisma = {
        comment: { pattern: /\/\/[^\r\n]*/, greedy: true },
        string: { pattern: /"(?:\\.|[^"\\\r\n])*"/, greedy: true },
        keyword: /\b(?:model|enum|type|datasource|generator|view)\b/,
        "class-name": /\b(?:String|Boolean|Int|BigInt|Float|Decimal|DateTime|Json|Bytes|Unsupported)\b/,
        annotation: { pattern: /@@?[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*/, alias: "function" },
        boolean: /\b(?:true|false)\b/,
        number: /\b\d+(?:\.\d+)?\b/,
        function: /\b[A-Za-z_]\w*(?=\()/,
        operator: /[=?]/,
        punctuation: /[{}[\](),.:]/,
    };
}, { displayName: "prisma", aliases: [] });
