import styled from "@emotion/styled";

export const SidePostWrapper = styled.div`
    display: flex;
    width: 100%;
    height: 100%;

    img {
        border-radius: 0.5rem;
        width: 40px;
        height: 40px;
        object-fit: cover;
    }

    .text-container {
        display: flex;
        justify-content: space-evenly;
        flex-direction: column;
        padding-left: 1rem;
        overflow: hidden;
    }

    .side-title {
        height: 55%;
        padding: 0 !important;
        overflow: hidden;
    }

    .side-desc {
        height: 45%;
        font-size: 0.8rem;
        color: gray;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;
