import { Link } from "@tanstack/react-router"
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from '@hookform/resolvers/zod';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
// import { Form } from "@/components/ui/form";
// import FormField from "@/components/form-field";
// import { SelectItem } from "@/components/ui/select";

// import { CreatePropertyFormValidation } from "@/lib/validations/properties";
// import { FormFieldsTypes } from "@/lib/constants/form-fields-types";
// import type { CreateProperty } from "shared";

// const PROPERTIES_TYPES = [
//   { value: "Apartamento", label: "Apartamento" },
//   { value: "Casa", label: "Casa" },
//   { value: "Casas", label: "Casas" },
//   { value: "Condominio", label: "Condominio" },
//   { value: "Lote", label: "Lote" },
//   { value: "Lotes", label: "Lotes" }
// ]

const CreateProperty = () => {
  // TODO: Fix Zod version compatibility issues
  // const form = useForm<z.infer<typeof CreatePropertyFormValidation>>({
  //   resolver: zodResolver(CreatePropertyFormValidation),
  //   defaultValues: {
  //     name: "",
  //     address: "",
  //     city: "",
  //     state: "",
  //     zipCode: "",
  //     country: "",
  //     propertyType: "",
  //     bedrooms: 0,
  //     bathrooms: 0,
  //     squareMeters: "0",
  //     description: "",
  //     amenities: [],
  //     images: [],
  //   },
  // });

  return (
    <>
    <header className="mb-8">
      <nav className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/properties" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                  Properties
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium text-gray-900">
                Create property
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>
      <div className="border-b border-gray-200 pb-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">
            Create New Property
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Add a new property to your portfolio by filling out the form below. Make sure to include all relevant details 
            such as location, amenities, and property specifications to provide accurate information for potential clients.
          </p>
        </div>
      </div>
    </header>
    <section className="mt-8 max-w-4xl">
      <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Form Temporarily Disabled</h3>
        <p className="text-yellow-700">
          The property creation form is temporarily disabled due to Zod version compatibility issues. 
          This will be resolved in a future update.
        </p>
      </div>
    </section>
    </>
  )
}

export default CreateProperty