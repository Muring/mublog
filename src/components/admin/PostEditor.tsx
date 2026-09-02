"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { renderMarkdown } from "@/lib/markdown/render";
import { Button } from "./Admin.styled";
import TagSelector from "./TagSelector";
import {
    InlineCodeIcon,
    CodeBlockIcon,
    LinkIcon,
    CalloutIcon,
    QuoteIcon,
} from "./ToolbarIcons";
import { useDebouncedEffect } from "@/hooks/useDebouncedEffect";
import { useSlugCheck } from "./useSlugCheck";
import { useEditorUploads } from "./useEditorUploads";
import { usePostSave } from "./usePostSave";
import {
    EditorWrapper,
    MetaGrid,
    SplitPane,
    EditorColumn,
    ToolbarButton,
    PaneTab,
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


const FENCE = "```";

export default function PostEditor({ initial, knownTags }: Props) {
    const [post, setPost] = useState(initial);
    const [postId, setPostId] = useState(initial.id);
    const [html, setHtml] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [tagError, setTagError] = useState<string | null>(null);
    // 좁은 화면에서만 쓰는 탭. 글을 쓰러 들어오는 화면이라 본문에서 시작한다.
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);

    const set = <K extends keyof EditablePost>(key: K, value: EditablePost[K]) =>
        setPost((prev) => ({ ...prev, [key]: value }));

    // 미리보기는 서버 왕복 없이 같은 renderMarkdown 을 브라우저에서 돌린다.
    // 동일 모듈이므로 미리보기와 발행 결과가 어긋날 수 없다.
    useDebouncedEffect(
        async (isCancelled) => {
            try {
                const rendered = await renderMarkdown(post.contentMd);
                if (!isCancelled()) setHtml(rendered);
            } catch {
                if (!isCancelled()) setHtml("<p>미리보기를 만들 수 없습니다.</p>");
            }
        },
        [post.contentMd],
        300
    );

    const slugState = useSlugCheck(post.slug, postId);

    const setContentMd = useCallback(
        (update: (previous: string) => string) =>
            setPost((prev) => ({ ...prev, contentMd: update(prev.contentMd) })),
        []
    );
    const setThumbnail = useCallback(
        (url: string) => setPost((prev) => ({ ...prev, thumbnail: url })),
        []
    );
    const { isUploadingThumb, uploadIntoBody, uploadThumbnail } = useEditorUploads(
        textareaRef,
        setContentMd,
        setThumbnail
    );

    const { save, pending, isSaving } = usePostSave(post, setPost, postId, setPostId, setTagError);

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

            <SplitPane activeTab={activeTab}>
                {/* 넓은 화면에서는 숨는다. 둘이 나란히 보이므로 고를 것이 없다 */}
                <div className="pane-tabs" role="tablist">
                    <PaneTab
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "write"}
                        className={activeTab === "write" ? "active" : ""}
                        onClick={() => setActiveTab("write")}
                    >
                        본문
                    </PaneTab>
                    <PaneTab
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "preview"}
                        className={activeTab === "preview" ? "active" : ""}
                        onClick={() => setActiveTab("preview")}
                    >
                        미리보기
                    </PaneTab>
                </div>

                <EditorColumn className={`pane-write ${isDragging ? "dragging" : ""}`}>
                    <div className="toolbar">
                        <ToolbarButton
                            data-tip="큰 제목"
                            aria-label="큰 제목"
                            onClick={() => insertAtCursor("## ", "", "제목")}
                        >
                            H2
                        </ToolbarButton>
                        <ToolbarButton
                            data-tip="작은 제목"
                            aria-label="작은 제목"
                            onClick={() => insertAtCursor("### ", "", "제목")}
                        >
                            H3
                        </ToolbarButton>
                        <ToolbarButton
                            className="mark"
                            data-tip="굵게"
                            aria-label="굵게"
                            onClick={() => insertAtCursor("**", "**", "굵게")}
                        >
                            B
                        </ToolbarButton>
                        <ToolbarButton
                            className="mark italic"
                            data-tip="기울임"
                            aria-label="기울임"
                            onClick={() => insertAtCursor("*", "*", "기울임")}
                        >
                            I
                        </ToolbarButton>
                        <ToolbarButton
                            data-tip="인라인 코드"
                            aria-label="인라인 코드"
                            onClick={() => insertAtCursor("`", "`", "코드")}
                        >
                            <InlineCodeIcon />
                        </ToolbarButton>
                        <ToolbarButton
                            data-tip="코드블록"
                            aria-label="코드블록"
                            onClick={() =>
                                insertAtCursor("\n" + FENCE + "ts\n", "\n" + FENCE + "\n", "code")
                            }
                        >
                            <CodeBlockIcon />
                        </ToolbarButton>
                        <ToolbarButton
                            data-tip="링크"
                            aria-label="링크"
                            onClick={() => insertAtCursor("[", "](url)", "링크")}
                        >
                            <LinkIcon />
                        </ToolbarButton>
                        <ToolbarButton
                            data-tip="콜아웃"
                            aria-label="콜아웃"
                            onClick={() =>
                                insertAtCursor("\n<aside>\n\n💡 ", "\n\n</aside>\n", "메모")
                            }
                        >
                            <CalloutIcon />
                        </ToolbarButton>
                        <ToolbarButton
                            data-tip="인용"
                            aria-label="인용"
                            onClick={() => insertAtCursor("\n> ", "", "인용")}
                        >
                            <QuoteIcon />
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

                <div className="pane-preview">
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
