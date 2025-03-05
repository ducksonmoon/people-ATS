import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";
import { fetchPublicCompanySettings } from "./redux/companySettingsSlice";
import AppRoutes from "./routes";

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchPublicCompanySettings());
  }, [dispatch]);

  return <AppRoutes />;
};

export default App;
