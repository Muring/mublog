import styled from "@emotion/styled";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 0.5rem;
  gap: 1rem;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  flex: 1;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal; /* 줄바꿈 허용 */
  line-height: 1.5;
`;

const Item = styled.div`
  display: flex;
  position: relative;
  max-width: 100%;
  width: 100%; /* 너비를 부모 기준으로 설정 */
`;

const Date = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100px;
  text-align: right;
  padding-right: 20px;
  font-weight: 600;
  flex-shrink: 0;
`;
const Marker = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
`;

const Circle = styled.div`
  width: 1.2rem;
  height: 1.2rem;
  background-color: var(--foreground);
  border-radius: 50%;
  z-index: 1;
`;

const LineTop = styled.div`
  width: 0.4rem;
  background-color: var(--foreground);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  height: 50%;
`;

const LineBottom = styled.div`
  width: 0.4rem;
  background-color: var(--foreground);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 50%;
  height: 100%;
`;

export default {
  Wrapper,
  Content,
  Item,
  Date,
  Marker,
  Circle,
  LineTop,
  LineBottom,
};
