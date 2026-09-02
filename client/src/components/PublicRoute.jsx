import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  if (localStorage.getItem("token")) {
  //return children
    return (<Navigate to="/" />);
  } else {
    return children;
  }
}
