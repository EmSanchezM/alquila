import { createFileRoute, redirect } from "@tanstack/react-router";

import MainLayout from "@/layouts/main-layout";

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
      <MainLayout user={user} />
    );
  },
});