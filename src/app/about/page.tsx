import HistoryTimeline from "@/components/HistoryTimeline";
import Introduction from "@/components/Introduction/Introduction";
import Profile from "@/components/Profile/Profile";
import ProjectTimeline from "@/components/ProjectTimeline";

export default function AboutPage() {
  const historyData = [
    { date: "2023.02", content: "상명대학교 천안캠퍼스 졸업" },
    { date: "2023.06", content: "SSAFY(삼성 청년 소프트웨어 아카데미) 10기 입학" },
    { date: "2024.06", content: "청년 CRM101 2기 입학" },
    { date: "2024.07", content: "SSAFY(삼성 청년 소프트웨어 아카데미) 10기 수료" },
    { date: "2024.11", content: "청년 CRM101 2기 수료" },
    { date: "2024.11", content: "Concentrix Korea 입사 – Salesforce 개발자" },
    { date: "2025.04", content: "Concentrix Korea AI COE 부서로 전배 – Frontend 개발자" },
  ];

  const projectData = [
    { date: "2024.11", content: "Windsor Global 모바일 프로젝트 - Salesforce" },
    { date: "2025.01", content: "Agentforce 해커톤; 프로젝트 Creamforce - Salesforce" },
    { date: "2024.06", content: "Samsung CPC 2차 개발 프로젝트 - Frontend" },
  ];

  return (
    <div className="home" style={{ minHeight: "100vh" }}>
      <Profile />
      <Introduction />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          flexWrap: "wrap",
          margin: "2rem 0",
        }}
      >
        <HistoryTimeline items={historyData} />
        {/* <HistoryTimeline items={projectData} /> */}
        <ProjectTimeline />
      </div>
    </div>
  );
}
