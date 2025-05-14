"use client";

import React from "react";
import styled from "@emotion/styled";

const TimelineWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
  line-height: 1.6;
`;

const TimelineItem = styled.div``;

const Date = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 4px;
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const Description = styled.div``;

export default function ProjectTimeline() {
  const data = [
    {
      date: "2024.11",
      title: "Windsor Global 모바일 프로젝트",
      description: "Salesforce 기반의 모바일 환경 구축 및 추가 개발 프로젝트에 참여",
    },
    {
      date: "2025.02",
      title: "Agentforce 해커톤 – 프로젝트 Creamforce",
      description:
        "Salesforce 플랫폼을 활용한 해커톤 프로젝트에 참가하여 Creamforce 서비스를 개발하여 인기상 수상",
    },
    {
      date: "2025.04 ~ 현재",
      title: "Samsung CPC 2차 개발",
      description: "프론트엔드 개발자로 참여하여 사용자 인터페이스를 설계 및 구현",
    },
  ];

  return (
    <TimelineWrapper>
      {data.map((item, index) => (
        <TimelineItem key={index}>
          <Date>{item.date}</Date>
          <Title>{item.title}</Title>
          <Description>{item.description}</Description>
        </TimelineItem>
      ))}
    </TimelineWrapper>
  );
}
