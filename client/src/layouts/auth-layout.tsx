import { Outlet } from "@tanstack/react-router";

const AuthLayout = () => {
  return (
    <section className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <Outlet />
    </section>
  )
}

export default AuthLayout