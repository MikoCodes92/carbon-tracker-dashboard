// src/styles/global.ts
import { createGlobalStyle } from "styled-components";
import "antd/dist/reset.css";

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', sans-serif;
    background-color: #f5f6fa;
    margin: 0;
    padding: 0;
  }

  .ant-input-number {
    width: 100%;
  }

  .ant-btn {
    font-weight: bold;
  }
`;
