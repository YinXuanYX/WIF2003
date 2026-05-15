import useAuthMe from '../../hooks/useAuthMe';

export default function AuthInitializer({ children }) {
  useAuthMe();
  return children;
}
