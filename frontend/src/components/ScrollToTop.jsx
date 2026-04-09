import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Whenever the pathname changes, instantly reset the window scroll to the absolute top
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
