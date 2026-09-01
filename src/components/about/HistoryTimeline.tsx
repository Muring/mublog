"use client";

import React from "react";
import Timeline from "./HistoryTimeline.styled";
import { historyData } from "@/data/about";

export default function HistoryTimeline() {
  return (
    <Timeline.Wrapper>
      <h2>히스토리</h2>
      <div>
        {historyData.map((item, index) => (
          <Timeline.Item key={index}>
            <Timeline.Date>{item.date}</Timeline.Date>
            <Timeline.Marker>
              {/* 선은 마지막 아이템 제외 */}
              {index !== 0 && <Timeline.LineTop />}
              <Timeline.Circle />
              {index !== historyData.length - 1 && <Timeline.LineBottom />}
            </Timeline.Marker>
            <Timeline.Content>{item.content}</Timeline.Content>
          </Timeline.Item>
        ))}
      </div>
    </Timeline.Wrapper>
  );
}
