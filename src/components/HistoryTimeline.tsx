"use client";

import React from "react";
import { TimelineWrapper } from "./HistoryTimeline.styled";

type HistoryItem = {
  date: string;
  content: string;
};

interface HistoryTimelineProps {
  items: HistoryItem[];
}

export default function HistoryTimeline({ items }: HistoryTimelineProps) {
  // export default function HistoryTimeline() {
  return (
    <TimelineWrapper>
      {items.map((item, index) => (
        <div className="timeline-item" key={index}>
          <div className="timeline-date">{item.date}</div>
          <div className="timeline-marker">
            {/* 선은 마지막 아이템 제외 */}
            {index !== 0 && <div className="line-top" />}
            <div className="circle" />
            {index !== items.length - 1 && <div className="line-bottom" />}
          </div>
          <div className="timeline-content">{item.content}</div>
        </div>
      ))}
    </TimelineWrapper>
  );
}
