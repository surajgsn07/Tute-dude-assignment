import CandidateInterview from "../Screens/Candidate/CandidateInterview";
import CandidateLogin from "../Screens/Candidate/CandidateLogin";
import PostInterview from "../Screens/Candidate/PostInterview.jsx";
import AdminDashboard from "../Screens/Admin/Dashboard.jsx";

export const adminRoutes = [
  {
    path: "/admin/:adminId",
    element: <AdminDashboard/>,
  },
];


export const candidateRoutes =[
    {
        path:"/candidate",
        element:<CandidateLogin/>
    },
    {
        path:"/candidate/:id",
        element:<CandidateInterview/>
    },
    {
        path:"/candidate/end-interview",
        element: <PostInterview/>
    }
]