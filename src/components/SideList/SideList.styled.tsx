import styled from "@emotion/styled";

export const SideListWrapper = styled.div<{ isClosing?: boolean }>`
    .side-list-container {
        width: 100%;
        padding: 0.5rem 0;
        font-weight: 600;
        height: 100%;
        max-height: 22.5rem;

        .side-list-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            gap: 1rem;
            padding: 0 1rem;
            margin: 0.4rem 0;
        }

        hr {
            flex: 1;
            height: 1px;
            flex-direction: row;
            margin-top: 0.2rem;
            background-color: var(--bordercolor);
            border: none;
        }

        .side-list-content {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            height: 100%;
            padding: 0 0.5rem;
        }

        .side-link {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0.5rem;
            width: 100%;
            height: auto;
        }
    }
`;
