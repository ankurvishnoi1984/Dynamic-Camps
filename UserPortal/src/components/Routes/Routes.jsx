import Login from "../login/login";
import DashboardPage from "../Pages/DashboardPage";
import RequestPage from "../Pages/RequestPage";
import DoctorPage from "../Pages/DoctorPage";
import PosterPage from "../Pages/PosterPage";
import PrescriberPage from "../Pages/PrescriberPage";
import IncentivePage from "../Pages/IncentivePage";
import BccDistPage from "../Pages/BccDistPage";
import PrescriptionPage from "../Pages/PrescriptionPage";
import EmpanormPage from "../Pages/EmpanormPage";
import DynamicCampPage from "../Pages/DynamicCampPage";
import MonthlyCampPage from "../Pages/MonthlyCampPage";
import NotFoundPage from "../Pages/NotFoundPage";
import PreviewPage from "../Pages/PreviewPage";

export const publicRoutes = [{ path: "/", element: <Login /> }];
const viewPoster = sessionStorage.getItem("viewPoster")
const viewCamp = sessionStorage.getItem("viewCamp")

const posterRoutes = [
  { path: "/poster", element: <PosterPage /> },
  { path: "/addDoctor/poster/:id", element: <PosterPage /> },
  { path: "/poster/viewPoster/:id", element: <PreviewPage /> }
];

const campRoutes = [
  { path: "/monthlycamp", element: <DynamicCampPage /> },
  { path: "/camp/:campId", element: <MonthlyCampPage /> },
  { path: "/campRequest", element: <RequestPage /> }
];


export const getPrivateRoutes =({ view_poster, view_camp })=> [
 { path: "/dashboard", element: <DashboardPage /> },
  { path: "/empanormCampaign", element: <EmpanormPage /> },
  { path: "/bccDistribution", element: <BccDistPage /> },
  { path: "/addDoctor", element: <DoctorPage /> },
  { path: "/prescriber", element: <PrescriberPage /> },
  { path: "/prescriptionUpload", element: <PrescriptionPage /> },

  ...(view_poster==="Y" ? posterRoutes : []),
  ...(view_camp==="Y" ? campRoutes : []),

  { path: "*", element: <NotFoundPage /> }]

