"use client";

import { useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ConfirmOverlay, ConfirmBox } from "@/components/ui/ConfirmDialog.styled";
import { useDialogKeys, useExitTransition, useScrollLock } from "@/hooks/useOverlay";
import { GameList } from "./GamePicker.styled";
import { games } from "./gameLink";

/**
 * 게임 고르기 창. 모양·움직임·키보드 동작은 확인 대화상자와 같은 공용 조각을 쓴다.
 * 헤더는 transform 이 걸린 조상 안에 있을 수 있어 body 로 꺼내 그린다.
 */
export default function GamePicker({ onClose }: { onClose: () => void }) {
    const boxRef = useRef<HTMLDivElement>(null);
    const firstRef = useRef<HTMLAnchorElement>(null);
    const { closing, requestClose, onAnimationEnd } = useExitTransition(onClose);
    const close = useCallback(() => requestClose(), [requestClose]);
    useScrollLock();
    useDialogKeys(boxRef, close, { initialFocus: firstRef, restoreFocus: true });

    return createPortal(
        <ConfirmOverlay
            data-closing={closing || undefined}
            onAnimationEnd={onAnimationEnd}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) close();
            }}
        >
            <ConfirmBox ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="game-picker-title">
                <h3 id="game-picker-title">어떤 게임을 할까요?</h3>
                <p>새 탭에서 열립니다.</p>

                <GameList>
                    {games.map((game, index) => (
                        <li key={game.id}>
                            <a
                                ref={index === 0 ? firstRef : undefined}
                                href={game.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${game.name} 플레이 (새 탭)`}
                                onClick={close}
                            >
                                <Image src={game.icon} alt="" width={28} height={28} className="auto-dark" />
                                <span className="game-text">
                                    <span className="game-name">{game.name}</span>
                                    <span className="game-desc">{game.description}</span>
                                </span>
                                <span className="game-external" aria-hidden="true">↗</span>
                            </a>
                        </li>
                    ))}
                </GameList>

                <div className="actions">
                    <button type="button" onClick={close}>닫기</button>
                </div>
            </ConfirmBox>
        </ConfirmOverlay>,
        document.body
    );
}
