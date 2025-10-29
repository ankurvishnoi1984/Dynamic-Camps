import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({children}) => {
    
    const isUserLoggedIn = sessionStorage.getItem('IsUserLoggedIn') === 'true';
    if(!isUserLoggedIn){
        return <Navigate to='/'  replace={true}></Navigate>
     }
     return children;
}

export default AdminProtectedRoute