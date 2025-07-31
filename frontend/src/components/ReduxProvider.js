"use client";

import { useEffect } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { store } from "@/app/store";
import { loadUserFromStorage } from "@/app/store/slices/authSlice";

function AuthWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, isInitialized } = useSelector(
    (state) => state.auth
  );

  const publicPaths = ["/login", "/register", "/"];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    console.log("Loading auth from storage...");
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      console.log("Auth routing check:", {
        isAuthenticated,
        pathname,
        isPublicPath,
        isInitialized,
      });

      // Sadece authenticated kullanıcılar ve login sayfasında olanlar için yönlendirme
      if (isAuthenticated && pathname === "/login") {
        console.log("Redirecting to dashboard - already authenticated");
        router.replace("/dashboard");
      }
      // Authenticated olmayan kullanıcılar için protected sayfalarda yönlendirme
      else if (!isAuthenticated && !isPublicPath) {
        console.log("Redirecting to login - not authenticated");
        router.replace("/login");
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    isInitialized,
    pathname,
    router,
    isPublicPath,
  ]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return children;
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthWrapper>{children}</AuthWrapper>
    </Provider>
  );
}
