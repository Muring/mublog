import styled from "@emotion/styled";

export const TimelineWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  .timeline-item {
    display: flex;
    position: relative;
    max-width: 100%;
    width: 100%; /* 너비를 부모 기준으로 설정 */
    /* min-width: 600px; ❌ 제거 */
  }

  .timeline-date {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100px;
    text-align: right;
    padding-right: 20px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .timeline-marker {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 20px;
    flex-shrink: 0;
  }

  .circle {
    width: 1.2rem;
    height: 1.2rem;
    background-color: black;
    border-radius: 50%;
    z-index: 1;
  }

  .line-top,
  .line-bottom {
    width: 0.4rem;
    background-color: black;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .line-top {
    top: 0;
    height: 50%;
  }

  .line-bottom {
    top: 50%;
    height: 100%;
  }

  .timeline-content {
    display: flex;
    align-items: center;
    padding: 1rem;
    flex: 1;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: normal; /* 줄바꿈 허용 */
    line-height: 1.5;
  }
`;
