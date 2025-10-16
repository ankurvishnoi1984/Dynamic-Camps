import { Navigate } from "react-router-dom";

const AdminProtectdRoute = ({children}) => {
    
    const userLoggedIn = sessionStorage.getItem('UserLoggedIn') === 'true';
    if(!userLoggedIn){
        return <Navigate to='/'  replace={true}></Navigate>
     }
     return children;
}

export default AdminProtectdRoute