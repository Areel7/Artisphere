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
import AboutUs from "./pages/AboutUs/AboutUs.jsx";
import AllArtists from "./pages/User/AllArtists.jsx";
import TermsPrivacy from "./pages/Company/TermsPrivacy.jsx";
import GDPR from "./pages/Company/GDPR.jsx";
import Support from "./pages/Company/Support.jsx";
import View3D from "./pages/Artworks/View3D.jsx";
import Search from "./pages/Artworks/Search.jsx";
import AllCurators from "./pages/User/AllCruator.jsx";

//Artist Routes
import ArtistRoutes from "./pages/Artist/ArtistRoutes.jsx";
import CreateArtwork from "./pages/Artist/CreateArtwork.jsx";
import MyArtWorks from "./pages/Artist/MyArtWorks.jsx";

//Curator Routes
import CuratorRoutes from "./pages/Curator/CuratorRoutes.jsx";
import CreateExhibition from "./pages/Curator/CreateExhibition.jsx";
import GetRequests from "./pages/Curator/getRequest.jsx";

//User Routes
import PrivateRoutes from "./pages/Auth/PrivateRoutes.jsx";
import Profile from "./pages/User/Profile.jsx";
import Cart from "./pages/User/Cart.jsx";
import Order from "./pages/User/Order.jsx";
import OrderDetail from "./pages/User/OrderDetail.jsx";
import Favorite from "./pages/User/Favorite.jsx";
import AllArtWorks from "./pages/Artworks/AllArtWorks.jsx";
import GalleryPage from "./pages/Gallery/GalleryPage.jsx";



const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} path="/" element={<Home />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/artists" element={<AllArtists />} />
      <Route path="/terms" element={<TermsPrivacy />} />
      <Route path="/gdpr" element={<GDPR />} />
      <Route path="/support" element={<Support />} />
      <Route path="/auth/login" element={<Home />} />
      <Route path="/auth/register" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/view-3d/:id" element={<View3D />} />
      <Route path="/curators" element={<AllCurators />} />

      <Route path="" element={<PrivateRoutes />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/artworks" element={<AllArtWorks />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<Order />} />
        <Route path="/order-detail" element={<OrderDetail />} />
        <Route path="/favorites" element={<Favorite />} />
      </Route>

      <Route path="" element={<ArtistRoutes />}>
        <Route path="artist/create-artwork" element={<CreateArtwork />} />
        <Route path="artist/my-artworks" element={<MyArtWorks />} />
      </Route>

      <Route path="" element={<CuratorRoutes />}>
        <Route
          path="curator/create-exhibition"
          element={<CreateExhibition />}
        />
        <Route path="curator/requests" element={<GetRequests />} />
      </Route>
    </Route>,
  ),
);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>,
);
