import Header from "@/components/shared/header";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    try {
      const data = { user: { email: "test@test.com" } };
      if (!data.user) {
        throw redirect({
          to: '/auth/sign-in'
        })
      }
      return data;
    } catch (e: unknown) {
      console.error(e);
      throw redirect({
        to: '/auth/sign-in'
      })
    }
  },
  component: () => {
    const user = { email: "test@test.com" };
    return (
      <div className="min-h-screen bg-gray-50">
        {user && (
          <>
            <Header />
          </>
        )}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    );
  },
});