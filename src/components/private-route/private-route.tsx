import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';

type PrivateRouteProps = {
  children: JSX.Element;
}

export function PrivateRoute({ children }: PrivateRouteProps): JSX.Element {
  const isAuthorized = useAppSelector((state) => state.authorizationStatus);
  return isAuthorized ? children : <Navigate to="/login" />;
}
