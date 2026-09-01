"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { renderMarkdown } from "@/lib/markdown/render";
import { Button } from "./Admin.styled";
import TagSelector from "./TagSelector";
import { useToast } from "@/providers/Toast";
import {
    EditorWrapper,
    MetaGrid,
    SplitPane,
    EditorColumn,
    ToolbarButton,
    PreviewArticle,
} from "./PostEditor.styled";

export type EditablePost = {
    id: string | null;
    slug: string;
    title: string;
    description: string;
    tags: string[];
    thumbnail: string;
    contentMd: string;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: string | null;
};

type Props = {
    initial: EditablePost;
    knownTags: string[];
};

type SlugState = { checking: boolean; available: boolean | null; reason: string | null };

const FENCE = "```";

export default function PostEditor({ initial, knownTags }: Props) {
    const router = useRouter();
    const toast = useToast();
    const [post, setPost] = useState(initial);
    const [postId, setPostId] = useState(initial.id);
    const [html, setHtml] = useState("");
    const [slugState, setSlugState] = useState<SlugState>({
        checking: false,
        available: null,
        reason: null,
    });
    const [pending, setPending] = useState<"DRAFT" | "PUBLISHED" | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploadingThumb, setIsUploadingThumb] = useState(false);
    const [tagError, setTagError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);

    const set = <K extends keyof EditablePost>(key: K, value: EditablePost[K]) =>
        setPost((prev) => ({ ...prev, [key]: value }));

    // 미리보기는 서버 왕복 없이 같은 renderMarkdown 을 브라우저에서 돌린다.
    // 동일 모듈이므로 미리보기와 발행 결과가 어긋날 수 없다.
    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const rendered = await renderMarkdown(post.contentMd);
                if (!cancelled) setHtml(rendered);
            } catch {
                if (!cancelled) setHtml("<p>미리보기를 만들 수 없습니다.</p>");
            }
        }, 300);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [post.contentMd]);

    // slug 중복/형식 실시간 확인
    useEffect(() => {
        if (!post.slug) {
            // 이 effect 는 디바운스 후 서버에 물어보는 외부 동기화다.
            // slug 를 비웠을 때 직전 판정을 지우는 것도 그 동기화의 일부다.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSlugState({ checking: false, available: null, reason: null });
            return;
        }
        let cancelled = false;
        // 이전 판정을 지우지 않고 checking 만 켠다.
        // 매 타이핑마다 결과를 비우면 "확인 중" 과 결과가 번갈아 나타나 깜빡인다.
        setSlugState((state) => ({ ...state, checking: true }));
        const timer = setTimeout(async () => {
            const params = new URLSearchParams({ slug: post.slug });
            if (postId) params.set("excludeId", postId);
            try {
                const res = await fetch("/api/admin/slug-check?" + params.toString());
                const data = await res.json();
                if (!cancelled) {
                    setSlugState({
                        checking: false,
                        available: data.available,
                        reason: data.reason,
                    });
                }
            } catch {
                if (!cancelled) setSlugState({ checking: false, available: null, reason: null });
            }
        }, 500);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [post.slug, postId]);

    /** 커서 위치에 텍스트를 끼워 넣는다 */
    const insertAtCursor = useCallback((before: string, after = "", placeholder = "") => {
        const el = textareaRef.current;
        if (!el) return;
        const { selectionStart: start, selectionEnd: end, value } = el;
        const selected = value.slice(start, end) || placeholder;
        const next = value.slice(0, start) + before + selected + after + value.slice(end);
        setPost((prev) => ({ ...prev, contentMd: next }));
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(start + before.length, start + before.length + selected.length);
        });
    }, []);

    /** 공통 업로드. 실패하면 null 을 돌려준다. */
    const upload = useCallback(async (file: File): Promise<string | null> => {
        const body = new FormData();
        body.append("file", file);
        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error ?? "이미지 업로드에 실패했습니다.");
                return null;
            }
            return data.url as string;
        } catch {
            toast.error("이미지 업로드 중 오류가 발생했습니다.");
            return null;
        }
    }, [toast]);

    /** 본문 이미지: 업로드하고 커서 위치에 마크다운으로 삽입 */
    const uploadIntoBody = useCallback(
        async (files: File[]) => {
            const el = textareaRef.current;
            if (!el) return;

            for (const file of files) {
                if (!file.type.startsWith("image/")) continue;

                const token = "![업로드 중 " + crypto.randomUUID().slice(0, 8) + "]()";
                const { selectionStart: pos, value } = el;
                setPost((prev) => ({
                    ...prev,
                    contentMd: value.slice(0, pos) + token + value.slice(pos),
                }));

                const url = await upload(file);
                setPost((prev) => ({
                    ...prev,
                    contentMd: prev.contentMd.replace(token, url ? "![](" + url + ")" : ""),
                }));
                if (url) toast.success("이미지를 올렸습니다.");
            }
        },
        [upload, toast]
    );

    /** 썸네일 업로드 */
    async function uploadThumbnail(file: File) {
        setIsUploadingThumb(true);
        const url = await upload(file);
        setIsUploadingThumb(false);
        if (url) set("thumbnail", url);
    }

    async function save(status: "DRAFT" | "PUBLISHED") {
        // 태그는 목록 필터의 기준이라 하나도 없으면 글이 어디에도 걸리지 않는다.
        if (post.tags.length === 0) {
            setTagError("태그를 하나 이상 선택하세요.");
            return;
        }

        setPending(status);

        const payload = {
            slug: post.slug,
            title: post.title,
            description: post.description || null,
            tags: post.tags,
            thumbnail: post.thumbnail || null,
            contentMd: post.contentMd,
            status,
            // 발행일은 서버가 발행 시점에 자동으로 넣는다.
            // 이미 발행된 글은 기존 값을 그대로 유지한다.
            publishedAt: post.publishedAt,
        };

        const res = await fetch(postId ? "/api/admin/posts/" + postId : "/api/admin/posts", {
            method: postId ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            setPending(null);
            toast.error(data.error ?? "저장에 실패했습니다.");
            return;
        }

        // 발행 후에는 실제로 게시된 글을 바로 보여준다.
        // 초안 저장은 이어서 쓰는 중이라 화면을 유지한다.
        if (status === "PUBLISHED") {
            // 결과를 먼저 알리고 이동한다. 이동이 끝날 때까지 pending 을 유지해
            // 버튼이 "이동 중"으로 남아 있게 한다.
            //
            // 여기서 router.refresh() 를 부르지 않는다. 떠날 편집 화면을 다시
            // 그리느라 이동이 눈에 띄게 느려지는데, 목적지는 이미 서버에서
            // revalidatePath 로 무효화돼 있어 새로 받아온다.
            toast.success("발행했습니다. 글로 이동합니다.");
            router.push("/" + (data.slug ?? post.slug));
            return;
        }

        setPending(null);
        setPost((prev) => ({
            ...prev,
            status,
            publishedAt: data.publishedAt ?? prev.publishedAt,
        }));
        toast.success("초안을 저장했습니다.");

        // 새 글이면 이후 저장이 PATCH 로 가도록 주소와 id 를 맞춰둔다
        if (!postId && data.id) {
            setPostId(data.id);
            router.replace("/admin/posts/" + data.id);
        }
    }

    const isSaving = pending !== null;
    const canSave = Boolean(post.title.trim()) && slugState.available !== false && !isSaving;

    return (
        <EditorWrapper>
            <div className="editor-head">
                <h2>{postId ? "포스트 수정" : "새 글 쓰기"}</h2>
                <div className="actions">
                    <Link href="/admin">
                        <Button as="span">목록</Button>
                    </Link>
                    <Button onClick={() => save("DRAFT")} disabled={!canSave}>
                        {pending === "DRAFT" ? "저장 중..." : "초안 저장"}
                    </Button>
                    <Button
                        className="primary"
                        onClick={() => save("PUBLISHED")}
                        disabled={!canSave}
                    >
                        {pending === "PUBLISHED" ? "발행 중..." : "발행"}
                    </Button>
                </div>
            </div>

            <MetaGrid>
                {/* 왼쪽 열: 글 자체를 설명하는 것들 */}
                <div className="meta-left">
                <label>
                    제목
                    <input
                        value={post.title}
                        onChange={(e) => set("title", e.target.value)}
                        placeholder="포스트 제목"
                    />
                </label>

                <label>
                    설명
                    <input
                        value={post.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="목록과 검색에 노출됩니다"
                    />
                </label>

                <label>
                    <span className="label-row">
                        글 주소(slug)
                        {/* 판정 결과를 라벨 오른쪽 끝에 붙여 입력란 아래를 비운다 */}
                        {slugState.available === false ? (
                            <span className="field-error">{slugState.reason}</span>
                        ) : slugState.available ? (
                            <span className="field-ok">/{post.slug}</span>
                        ) : slugState.checking ? (
                            <span className="field-hint">확인 중...</span>
                        ) : (
                            <span className="field-hint">글이 열릴 주소입니다</span>
                        )}
                    </span>
                    <input
                        value={post.slug}
                        onChange={(e) => set("slug", e.target.value)}
                        placeholder="english-kebab-case"
                    />
                </label>

                {/*
                  label 로 감싸면 안 된다. label 은 클릭 시 내부 첫 번째 폼 요소를
                  활성화시키는데, 태그 칩이 button 이라 어떤 칩을 눌러도 첫 칩이
                  함께 토글된다. 캡션은 span 으로 따로 둔다.
                */}
                <div className="field">
                    <span className="field-label">태그</span>
                    <TagSelector
                        knownTags={knownTags}
                        selected={post.tags}
                        error={tagError}
                        onChange={(tags) => {
                            set("tags", tags);
                            if (tags.length > 0) setTagError(null);
                        }}
                    />
                </div>
                </div>

                {/* 오른쪽 열: 카드 폭에 맞춰 실물 크기로 보여준다 */}
                <div className="meta-right">

                <label>
                    썸네일
                    <div className="thumb-row">
                        <input
                            value={post.thumbnail}
                            onChange={(e) => set("thumbnail", e.target.value)}
                            placeholder="업로드하거나 /thumbnails/... 경로"
                        />
                        <button
                            type="button"
                            className="thumb-upload"
                            onClick={() => thumbInputRef.current?.click()}
                            disabled={isUploadingThumb}
                        >
                            {isUploadingThumb ? "올리는 중" : "업로드"}
                        </button>
                        <input
                            ref={thumbInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void uploadThumbnail(file);
                                e.target.value = "";
                            }}
                        />
                    </div>
                    {post.thumbnail ? (
                        // 미리보기용이라 next/image 최적화를 태우지 않는다
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="thumb-preview" src={post.thumbnail} alt="썸네일 미리보기" />
                    ) : (
                        <div className="thumb-empty">목록에 보일 크기 그대로 미리 봅니다</div>
                    )}
                </label>
                </div>
            </MetaGrid>

            <SplitPane>
                <EditorColumn className={isDragging ? "dragging" : ""}>
                    <div className="toolbar">
                        <ToolbarButton onClick={() => insertAtCursor("## ", "", "제목")}>
                            H2
                        </ToolbarButton>
                        <ToolbarButton onClick={() => insertAtCursor("### ", "", "제목")}>
                            H3
                        </ToolbarButton>
                        <ToolbarButton onClick={() => insertAtCursor("**", "**", "굵게")}>
                            B
                        </ToolbarButton>
                        <ToolbarButton onClick={() => insertAtCursor("*", "*", "기울임")}>
                            I
                        </ToolbarButton>
                        <ToolbarButton onClick={() => insertAtCursor("`", "`", "코드")}>
                            인라인코드
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() =>
                                insertAtCursor("\n" + FENCE + "ts\n", "\n" + FENCE + "\n", "code")
                            }
                        >
                            코드블록
                        </ToolbarButton>
                        <ToolbarButton onClick={() => insertAtCursor("[", "](url)", "링크")}>
                            링크
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() =>
                                insertAtCursor("\n<aside>\n\n💡 ", "\n\n</aside>\n", "메모")
                            }
                        >
                            콜아웃
                        </ToolbarButton>
                        <ToolbarButton onClick={() => insertAtCursor("\n> ", "", "인용")}>
                            인용
                        </ToolbarButton>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={post.contentMd}
                        onChange={(e) => set("contentMd", e.target.value)}
                        placeholder="마크다운으로 작성하세요. 이미지는 끌어다 놓거나 붙여넣으면 자동 업로드됩니다."
                        spellCheck={false}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            void uploadIntoBody(Array.from(e.dataTransfer.files));
                        }}
                        onPaste={(e) => {
                            const files = Array.from(e.clipboardData.files);
                            if (files.length > 0) {
                                e.preventDefault();
                                void uploadIntoBody(files);
                            }
                        }}
                    />
                </EditorColumn>

                <div>
                    <PreviewArticle>
                        <h1>{post.title || "제목 없음"}</h1>
                        <h5>{post.description}</h5>
                        <hr />
                        <div dangerouslySetInnerHTML={{ __html: html }} />
                    </PreviewArticle>
                </div>
            </SplitPane>
        </EditorWrapper>
    );
}
