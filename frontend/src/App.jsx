import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AuthPage } from "./components/AuthPage";
import { loginUser, signupUser } from "./services/mapsApi";
import { MindMapPage } from "./pages/MindMapPage";

const STORAGE_KEY = "mind-map-user";

const getStoredUser = () => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [authError, setAuthError] = useState("");

  const persistUser = (user) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setCurrentUser(user);
    setAuthError("");
  };

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: persistUser,
    onError: (error) => setAuthError(error.message)
  });

  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: persistUser,
    onError: (error) => setAuthError(error.message)
  });

  const isLoading = useMemo(
    () => loginMutation.isPending || signupMutation.isPending,
    [loginMutation.isPending, signupMutation.isPending]
  );

  if (!currentUser) {
    return (
      <AuthPage
        onLogin={(payload) => loginMutation.mutate(payload)}
        onSignup={(payload) => signupMutation.mutate(payload)}
        isLoading={isLoading}
        error={authError}
      />
    );
  }

  return (
    <MindMapPage
      currentUser={currentUser}
      onLogout={() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setCurrentUser(null);
      }}
    />
  );
}
