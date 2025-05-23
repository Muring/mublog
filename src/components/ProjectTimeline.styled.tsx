import styled from "@emotion/styled";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: baseline;
  gap: 1rem;
  padding: 0 0.5rem;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  line-height: 1.6;
`;

const Item = styled.div`
  padding-bottom: 1.5rem;
`;

const Date = styled.div`
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 4px;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 4px;
  font-style: italic;
`;

const Description = styled.div``;

export default { Wrapper, Item, Content, Title, Date, Description };
