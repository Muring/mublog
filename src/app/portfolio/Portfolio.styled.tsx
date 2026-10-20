"use client";

import styled from "@emotion/styled";
import { mobile } from "@/styles/breakpoints";
import { animatedLink } from "@/styles/link";

/**
 * 포트폴리오 화면. 페이지·갤러리·목차 자리가 같은 클래스를 나눠 쓰므로 페이지 뿌리 하나에 규칙을 모으고,
 * 안쪽은 `pf-` 접두사 클래스로 고른다. 블로그와 다른 제 팔레트(--accent 등)를 뿌리에서 정한다.
 */
export const PortfolioRoot = styled.div`
    &.pf-page, .pf-page { --accent: var(--linkhovercolor); --description-highlight: var(--portfolio-description-highlight); --desccolor: var(--portfolio-description); max-width: 1100px; padding: 0 32px; margin: 0 auto; line-height: 1.7; }
    &.pf-page :is( .pf-intro, .pf-heroBottom, .pf-skills p, .pf-projectNav a span, .pf-projectNumber, .pf-period, .pf-projectMeta dt, .pf-contributions p, .pf-contactBottom, .pf-galleryHeading > span, .pf-viewerNavigation > span > span ), .pf-page :is( .pf-intro, .pf-heroBottom, .pf-skills p, .pf-projectNav a span, .pf-projectNumber, .pf-period, .pf-projectMeta dt, .pf-contributions p, .pf-contactBottom, .pf-galleryHeading > span, .pf-viewerNavigation > span > span ) { transition: color 150ms ease; }
    &.pf-page :is( .pf-intro, .pf-heroBottom, .pf-skills p, .pf-projectNav a span, .pf-projectNumber, .pf-period, .pf-projectMeta dt, .pf-contributions p, .pf-contactBottom, .pf-galleryHeading > span, .pf-viewerNavigation > span > span ):hover, .pf-page :is( .pf-intro, .pf-heroBottom, .pf-skills p, .pf-projectNav a span, .pf-projectNumber, .pf-period, .pf-projectMeta dt, .pf-contributions p, .pf-contactBottom, .pf-galleryHeading > span, .pf-viewerNavigation > span > span ):hover { color: var(--description-highlight); }
    &.pf-page a:focus-visible, .pf-page a:focus-visible, &.pf-page button:focus-visible, .pf-page button:focus-visible { outline: 2px solid var(--accent); outline-offset: 6px; border-radius: 3px; }
    &.pf-page a, .pf-page a { transition: color 0.15s; }
    &.pf-page a:hover, .pf-page a:hover { color: var(--accent); }
    .pf-hero { padding-top: 128px; }
    .pf-portfolioNavigation { margin-top: 28px; }
    .pf-expertise, .pf-contact { scroll-margin-top: 95px; }
    @media (min-width: 1540px) {
        .pf-portfolioNavigation { position: fixed; top: 112px; left: calc(50% + 570px); width: 180px; margin-top: 0; z-index: 10; }
        /* 고정 패널: 접기 대신 제목·맨 위로를 보이고, 목차 자체가 스크롤한다. */
        .pf-portfolioNavigation [data-toc] { max-height: calc(100dvh - 144px); overflow-y: auto; overscroll-behavior: contain; }
        .pf-portfolioNavigation [data-toc] [data-toc-title], .pf-portfolioNavigation [data-toc] [data-toc-body], .pf-portfolioNavigation [data-toc] [data-toc-top] { display: block; }
        .pf-portfolioNavigation [data-toc] [data-toc-toggle] { display: none; }
        .pf-portfolioNavigation [data-toc] [data-toc-body] { margin-top: 0; }
    }
    .pf-eyebrow { display: flex; align-items: center; gap: 10px; font-size: 12px; letter-spacing: 0.14em; font-weight: 800; }
    .pf-dot { width: 7px; height: 7px; background: var(--accent); border-radius: 50%; }
    .pf-greeting { margin-top: 65px; font-size: 17px; font-weight: 700; }
    .pf-hero h1 { margin-top: 20px; font-size: clamp(36px, 5.3vw, 64px); letter-spacing: -0.065em; font-weight: 900; line-height: 1.3; }
    .pf-hero h1 span { color: var(--accent); }
    .pf-intro { margin-top: 28px; color: var(--desccolor); font-size: 17px; line-height: 1.9; word-break: keep-all; }
    .pf-heroBottom { display: flex; justify-content: space-between; gap: 20px; margin-top: 75px; padding-bottom: 22px; border-bottom: 1px solid var(--bordercolor); color: var(--desccolor); font-size: 12px; }
    .pf-heroBottom span:last-child { font-size: 10px; letter-spacing: 0.12em; }
    .pf-kicker { color: var(--accent); font-size: 11px; letter-spacing: 0.12em; font-weight: 800; }
    .pf-expertise { padding: 60px 0 75px; }
    .pf-expertise h2 { font-size: 22px; margin-top: 10px; letter-spacing: -0.04em; }
    .pf-skills { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 36px 40px; margin-top: 30px; }
    .pf-skills > div { border-left: 2px solid var(--bordercolor); padding-left: 20px; }
    .pf-skills h3 { font-size: 16px; margin: 0 0 9px; }
    .pf-skills p { color: var(--desccolor); font-size: 13px; line-height: 1.9; }
    .pf-skills ul { margin: 14px 0; padding-left: 17px; list-style: disc; font-size: 13px; line-height: 1.9; }
    .pf-skills li + li { margin-top: 7px; }
    .pf-skillProjects { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; font-size: 12px; }
    .pf-skillProjectsLabel { flex-basis: 100%; color: var(--desccolor); font-weight: 700; }
    .pf-skillProjects a { position: relative; display: inline-block; padding: 4px 0; color: var(--foreground); font-weight: 600; }
    /* 평소엔 밑줄이 없고, 호버하면 accent 선이 왼쪽에서 오른쪽으로 그어진다(.animatedLink 와 같은 움직임). */
    .pf-skillProjects a::after { content: ""; position: absolute; left: 0; right: 0; bottom: 1px; height: 1px; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform 280ms ease; }
    .pf-skillProjects a:is(:hover, :focus-visible)::after { transform: scaleX(1); }
    .pf-projects { scroll-margin-top: 95px; }
    .pf-sectionHeading { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; padding-top: 40px; border-top: 1px solid var(--bordercolor); }
    .pf-sectionHeading h2 { font-size: 36px; letter-spacing: -0.055em; margin-top: 10px; }
    .pf-projectNav { display: flex; flex-wrap: wrap; gap: 10px 24px; padding: 24px 0 30px; }
    .pf-projectNav a { display: flex; align-items: center; gap: 9px; min-height: 36px; font-size: 13px; font-weight: 700; }
    .pf-projectNav a span { color: var(--desccolor); font-size: 11px; }
    .pf-project { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 56px; padding: 65px 0 75px; border-top: 1px solid var(--bordercolor); scroll-margin-top: 76px; }
    .pf-projectMeta { position: sticky; top: 96px; align-self: start; }
    .pf-projectNumber { display: block; color: var(--desccolor); font-size: 38px; font-weight: 300; line-height: 1; margin-bottom: 25px; }
    .pf-projectMeta h3 { font-size: 31px; letter-spacing: -0.045em; margin: 8px 0 10px; line-height: 1.3; }
    .pf-period { color: var(--desccolor); font-size: 13px; }
    .pf-projectMeta dl { margin-top: 26px; display: grid; gap: 15px; }
    .pf-projectMeta dt { font-size: 10px; color: var(--desccolor); letter-spacing: 0.1em; }
    .pf-projectMeta dd { font-size: 13px; margin-top: 3px; word-break: keep-all; }
    .pf-projectLinks { margin-top: 24px; display: flex; flex-direction: column; align-items: flex-start; gap: 3px; }
    .pf-projectLinks a { font-size: 12px; font-weight: 700; min-height: 34px; display: inline-flex; align-items: center; gap: 8px; }
    .pf-projectLinks svg { flex-shrink: 0; }
    /* 공용 링크 모양(styles/link.ts). AI 관리의 연결 작업 링크도 같은 것을 쓴다 */
    .pf-animatedLink { ${animatedLink} }
    .pf-summary { font-size: 17px; line-height: 1.95; letter-spacing: -0.025em; word-break: keep-all; }
    .pf-projectBody { min-width: 0; }
    .pf-detailHeading { font-size: 15px; margin-top: 30px; }
    .pf-contributions { display: grid; gap: 21px; margin-top: 20px; }
    .pf-contributions li { display: flex; gap: 15px; }
    .pf-contributions li > span { color: var(--accent); font-size: 11px; padding-top: 4px; font-weight: 700; }
    .pf-contributions h5 { font-size: 14px; font-weight: 800; }
    .pf-contributions p { margin-top: 5px; font-size: 13px; line-height: 1.9; color: var(--desccolor); word-break: keep-all; }
    .pf-stackHeading { font-size: 12px; margin-top: 28px; margin-bottom: 10px; }
    .pf-tags { display: flex; flex-wrap: wrap; gap: 7px; }
    .pf-tags li { padding: 4px 10px; background: var(--codefontbgcolor); border-radius: 3px; font-size: 11px; }
    .pf-contact { padding: 65px 0 28px; border-top: 1px solid var(--bordercolor); }
    .pf-contact h2 { font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.05em; line-height: 1.4; margin: 16px 0 24px; }
    .pf-email { font-size: clamp(15px, 2.4vw, 22px); border-bottom: 1px solid var(--bordercolor); padding-bottom: 8px; display: inline-flex; align-items: center; gap: 35px; }
    .pf-contactActions { margin-top: 36px; }
    &.pf-page .pf-button, .pf-page .pf-button { display: inline-flex; align-items: center; min-height: 44px; padding: 12px 20px; border-radius: 4px; background: var(--foreground); color: var(--background); font-size: 14px; font-weight: 700; transition: background-color 150ms ease; }
    &.pf-page .pf-button:hover, .pf-page .pf-button:hover { background: var(--accent); color: var(--background); }
    .pf-contactBottom { display: flex; justify-content: flex-end; margin-top: 60px; font-size: 12px; color: var(--desccolor); }
    .pf-contactBottom a { padding: 10px 0; }
    @media (max-width: 900px) {
        .pf-project { grid-template-columns: 190px minmax(0, 1fr); gap: 28px; }
        .pf-projectMeta h3 { font-size: 27px; }
    }
    ${mobile} {
        &.pf-page, .pf-page { padding: 0 22px; }
        .pf-hero { padding-top: 104px; }
        .pf-eyebrow { font-size: 10px; gap: 7px; }
        .pf-greeting { margin-top: 45px; font-size: 15px; }
        .pf-hero h1 { font-size: clamp(31px, 8.7vw, 52px); }
        .pf-intro { font-size: 14px; margin-top: 23px; }
        .pf-desktopBreak { display: none; }
        .pf-heroBottom { margin-top: 44px; font-size: 11px; }
        &.pf-page .pf-button, .pf-page .pf-button { padding: 10px 14px; font-size: 12px; }
        .pf-heroBottom span:last-child { display: none; }
        .pf-expertise { padding: 40px 0 48px; }
        .pf-expertise h2 { font-size: 19px; }
        .pf-skills { grid-template-columns: 1fr; gap: 22px; }
        .pf-sectionHeading { display: block; padding-top: 30px; }
        .pf-sectionHeading h2 { font-size: 29px; }
        .pf-projectNav { gap: 4px 18px; padding: 18px 0 24px; }
        .pf-project { grid-template-columns: 1fr; gap: 28px; padding: 36px 0 44px; }
        .pf-projectMeta { position: static; }
        .pf-projectNumber { font-size: 27px; margin-bottom: 15px; }
        .pf-projectMeta h3 { font-size: 30px; }
        .pf-projectMeta dl { display: flex; gap: 26px; margin-top: 18px; }
        .pf-projectLinks { flex-direction: row; flex-wrap: wrap; gap: 8px 16px; margin-top: 16px; }
        .pf-summary { font-size: 15px; }
        .pf-contributions p { font-size: 13px; }
        .pf-contact { padding-top: 42px; }
        .pf-contactBottom { margin-top: 45px; }
    }
    .pf-gallerySection { min-width: 0; margin-bottom: 32px; }
    .pf-projectBody { min-width: 0; }
    .pf-galleryViewer figure { margin: 0; }
    .pf-galleryHeading { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 22px; color: var(--desccolor); font-size: 13px; }
    .pf-galleryHeading strong { margin-left: 8px; color: var(--accent); }
    .pf-mainImage { display: block; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border: 0; padding: 0; background: none; cursor: zoom-in; }
    .pf-imageTrack { display: flex; width: 100%; height: 100%; transition: transform 380ms cubic-bezier(0.22, 0.61, 0.36, 1); }
    .pf-imageSlide { position: relative; display: block; flex: 0 0 100%; height: 100%; min-width: 0; }
    .pf-mainImage img { display: block; object-fit: contain; object-position: center; }
    .pf-viewerCaption { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 20px; }
    .pf-viewerCaption p { font-size: 13px; margin: 0; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .pf-viewerCaption > div:first-child { min-width: 0; min-height: 72px; flex: 1; }
    .pf-viewerCaption > div:first-child > button { white-space: nowrap; }
    .pf-viewerCaption > div:first-child > button, .pf-viewerCaption a { display: inline-block; margin-top: 2px; margin-right: 15px; padding: 2px 0; border: 0; background: none; font: inherit; font-size: 12px; color: var(--desccolor); cursor: pointer; transition: color 150ms ease; }
    .pf-viewerCaption > div:first-child :is(button, a):is(:hover, :focus-visible) { color: var(--accent); }
    .pf-viewerNavigation { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
    .pf-viewerNavigation button { width: 40px; height: 40px; border: 1px solid var(--bordercolor); border-radius: 50%; background: var(--background); color: var(--foreground); font-size: 17px; cursor: pointer; outline: 1px solid transparent; outline-offset: -1px; transition: outline-color 150ms ease, border-color 150ms ease, color 150ms ease; }
    .pf-viewerNavigation button:disabled { opacity: 0.3; cursor: default; }
    .pf-viewerNavigation button:hover:not(:disabled) { color: var(--accent); border-color: transparent; outline-color: var(--accent); }
    .pf-viewerNavigation > span { font-size: 12px; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .pf-viewerNavigation > span > span { color: var(--desccolor); }
    .pf-thumbnailStrip { position: relative; display: flex; gap: 12px; overflow-x: auto; margin-top: 22px; padding: 4px 2px 12px; scrollbar-width: thin; scrollbar-color: var(--bordercolor) transparent; overscroll-behavior-x: contain; }
    .pf-thumbnailStrip button { position: relative; flex: 0 0 96px; height: 72px; border: 0; padding: 4px; background: var(--codefontbgcolor); cursor: pointer; opacity: 0.55; }
    .pf-thumbnailStrip button:hover, .pf-thumbnailStrip button[aria-pressed="true"] { opacity: 1; }
    .pf-thumbnailStrip button[aria-pressed="true"] { outline: 2px solid var(--accent); outline-offset: 2px; }
    .pf-thumbnailStrip img { display: block; width: 100%; height: 100%; object-fit: contain; }
    .pf-thumbnailStrip button > span { position: absolute; bottom: 3px; right: 3px; padding: 1px 4px; background: var(--background); color: var(--foreground); font-size: 10px; }
    .pf-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    .pf-gallerySection :is(button, a, [tabindex]):focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
    ${mobile} {
        .pf-viewerCaption { align-items: flex-start; gap: 12px; }
        .pf-viewerCaption > div:first-child { min-height: 84px; }
        .pf-viewerNavigation { gap: 8px; }
        .pf-viewerNavigation button { width: 34px; height: 34px; }
        .pf-viewerCaption p { font-size: 12px; }
        .pf-viewerCaption > div:first-child > button, .pf-viewerCaption a { font-size: 11px; }
        .pf-thumbnailStrip button { flex-basis: 76px; height: 60px; }
    }
    @media (prefers-reduced-motion: reduce) {
        .pf-imageTrack, .pf-skillProjects a::after { transition: none; }
    }
`;
