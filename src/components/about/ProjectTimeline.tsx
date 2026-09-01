"use client";

import React from "react";
import { projectData } from "@/data/about";
import Timeline from "./ProjectTimeline.styled";

export default function ProjectTimeline() {
  return (
    <Timeline.Wrapper>
      <h2>프로젝트</h2>
      <Timeline.Content>
        {projectData.map((item, index) => (
          <Timeline.Item key={index}>
            <Timeline.Date>{item.date}</Timeline.Date>
            <Timeline.Title>{item.title}</Timeline.Title>
            <Timeline.Description>{item.description}</Timeline.Description>
          </Timeline.Item>
        ))}
      </Timeline.Content>
    </Timeline.Wrapper>
  );
}
