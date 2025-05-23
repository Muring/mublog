import HistoryTimeline from "@/components/HistoryTimeline";
import Introduction from "@/components/Introduction";
import Profile from "@/components/Profile";
import ProjectTimeline from "@/components/ProjectTimeline";

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
