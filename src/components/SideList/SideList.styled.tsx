import styled from "@emotion/styled";

export const SideListWrapper = styled.div<{ isClosing?: boolean }>`
    .side-list-container {
        width: 100%;
        padding: 0.5rem 0;
        font-weight: 600;
        height: 19rem;

        .side-list-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            gap: 1rem;
            padding: 0 1rem;
            margin-bottom: 0.3rem;
        }

        hr {
            flex: 1;
            height: 1px;
            flex-direction: row;
            margin-top: 0.2rem;
            background-color: rgba(0, 0, 0, 0.2); /* 연하게 */
            border: none;
        }

        .side-list-content {
            display: flex;
            flex-direction: column;
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
