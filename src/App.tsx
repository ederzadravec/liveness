import React from "react";
import { ThemeProvider, createGlobalStyle } from "styled-components";

import Liveness from "./components/Liveness";

const DefaultStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0
  }
`;

const App: React.FC = () => {
  return (
    <ThemeProvider theme={{}}>
      <DefaultStyle />
      <Liveness />
    </ThemeProvider>
  );
};

export default App;
