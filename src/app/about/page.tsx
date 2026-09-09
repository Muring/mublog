import type { Metadata } from "next";
import HistoryTimeline from "@/components/about/HistoryTimeline";
import Introduction from "@/components/about/Introduction";
import Profile from "@/components/Profile";
import ProjectTimeline from "@/components/about/ProjectTimeline";

export const metadata: Metadata = {
  title: "소개",
  description: "방랑하는 개발자 엄세현이 걸어온 길과 만들어 온 것들",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
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
        <HistoryTimeline />
        <ProjectTimeline />
      </div>
    </div>
  );
}
