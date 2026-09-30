"use client";
import styled from "@emotion/styled";
import { segmented } from "@/styles/segmented";

export const AiSegments = styled.div`${segmented}; flex-wrap: wrap;`;
export const number = (value: number) => value.toLocaleString("ko-KR");
