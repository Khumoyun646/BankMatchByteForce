import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Match from "./pages/Match";
import Banks from "./pages/Banks";
import Assistant from "./pages/Assistant";
import AiTools from "./pages/AiTools";
import RootLayout from "./layout/RootLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "quiz", element: <Quiz /> },
      { path: "match", element: <Match /> },
      { path: "banks", element: <Banks /> },
      { path: "assistant", element: <Assistant /> },
      { path: "ai-tools", element: <AiTools /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
