import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import store from "./redux/store.js";
import { Provider } from "react-redux";
import {
  Route,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";

import Home from "./pages/Home.jsx";

//Artist Routes
import ArtistRoutes from "./pages/Artist/ArtistRoutes.jsx";
import CreateArtwork from "./pages/Artist/CreateArtwork.jsx";

//Curator Routes
import CuratorRoutes from "./pages/Curator/CuratorRoutes.jsx";
import CreateExhibition from "./pages/Curator/CreateExhibition.jsx";

//User Routes
import PrivateRoutes from "./pages/Auth/PrivateRoutes.jsx";
import Profile from "./pages/User/Profile.jsx";


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} path="/" element={<Home />} />
      <Route path="/auth/login" element={<Home />} />
      <Route path="/auth/register" element={<Home />} />

      <Route path="" element={<PrivateRoutes />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="" element={<ArtistRoutes />}>
        <Route path="artist/create-artwork" element={<CreateArtwork />} />
      </Route>

      <Route path="" element={<CuratorRoutes />}>
        <Route
          path="curator/create-exhibition"
          element={<CreateExhibition />}
        />
      </Route>
    </Route>,
  ),
);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>,
);
