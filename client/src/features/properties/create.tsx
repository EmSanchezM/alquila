import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Link } from "@tanstack/react-router"

const CreateProperty = () => {
  return (
    <>
    <header className="mb-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/properties">Properties</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create property</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
      <h2 className="text-3xl font-bold tracking-tight">Create property</h2>
      <p className="text-sm text-muted-foreground">
        Description of the page and functionality
      </p>
    </div>
    </header>
    <section className="mt-2">
      form
    </section>
    </>
  )
}

export default CreateProperty