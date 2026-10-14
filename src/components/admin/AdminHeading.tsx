"use client";

import Link from "next/link";
import styles from "./AdminHeading.module.css";

/** 관리 화면 공통 머리줄: 제목 · 탭 · 동작 버튼 한 줄. 블로그 관리와 AI 관리가 같이 쓴다 */
export default function AdminHeading({ title, tabs, actions, className }: { title: string; tabs: React.ReactNode; actions?: React.ReactNode; className?: string }) {
    return (
        <header className={`${styles.heading} ${className ?? ""}`}>
            <h1 className={styles.title}>{title}</h1>
            {tabs}
            {actions && <div className={styles.actions}>{actions}</div>}
        </header>
    );
}

type Tab = { key: string; label: string; current: boolean } & ({ href: string } | { onSelect: () => void });

/**
 * 밑줄 탭. 주소가 바뀌는 탭(블로그 관리)은 링크로, 한 화면 안에서 내용만 바꾸는 탭(AI 관리)은 tab 역할 버튼으로 그린다.
 * 모양은 같고, 지금 탭 표시는 data-current 하나로 맞춘다
 */
export function AdminTabs({ label, tabs }: { label: string; tabs: Tab[] }) {
    if (tabs.every(tab => "href" in tab)) {
        return (
            <nav className={styles.tabs} aria-label={label}>
                {tabs.map(tab => "href" in tab && <Link key={tab.key} href={tab.href} aria-current={tab.current ? "page" : undefined} data-current={tab.current || undefined}>{tab.label}</Link>)}
            </nav>
        );
    }
    return (
        <div className={styles.tabs} role="tablist" aria-label={label}>
            {tabs.map(tab => "onSelect" in tab && <button key={tab.key} type="button" role="tab" aria-selected={tab.current} data-current={tab.current || undefined} onClick={tab.onSelect}>{tab.label}</button>)}
        </div>
    );
}

/** 탭이 주소를 읽느라 Suspense 로 늦게 그려질 때 같은 높이를 잡아 둔다 */
export function AdminTabsPlaceholder() {
    return <div className={`${styles.tabs} ${styles.placeholder}`} aria-hidden />;
}
