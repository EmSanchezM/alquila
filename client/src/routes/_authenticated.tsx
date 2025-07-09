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
    return (
      <div>
        <Outlet />
      </div>
    );
  },
});