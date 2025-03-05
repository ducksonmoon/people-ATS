import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import store from "./redux/store";
import DynamicThemeProvider from "./theme/DynamicThemeProvider";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <DynamicThemeProvider>
          <App />
        </DynamicThemeProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
