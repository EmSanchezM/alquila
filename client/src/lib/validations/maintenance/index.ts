import { z } from "zod";

import {
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  photosOf,
  type MaintenanceRequest,
  type MaintenanceRequestInput,
} from "@/lib/services/maintenance";

const values = (options: readonly { value: string }[]): string[] => options.map((o) => o.value);
const oneOf = (options: readonly { value: string }[], message: string) =>
  z.string().refine((v) => values(options).includes(v), message);

/** Select value for "no renter"; a Select item cannot have an empty value. */
export const NO_RENTER = "none";

const cost = z
  .string()
  .trim()
  .refine((v) => /^(\d+(\.\d{1,2})?)?$/.test(v), "Enter an amount with up to 2 decimals")
  .refine((v) => v === "" || Number(v) <= 99_999_999.99, "Use an amount up to 99999999.99");

// Form values are strings, as typed in the inputs. Limits mirror the server schema
// and the `maintenance_requests` table. Dates are YYYY-MM-DD.
export const MaintenanceFormValidation = z.object({
  propertyId: z.string().min(1, "Select a property"),
  renterId: z.string(),
  title: z.string().trim().min(1, "Enter a title").max(200, "Use 200 characters or fewer"),
  description: z.string().trim().min(1, "Describe the issue"),
  category: oneOf(MAINTENANCE_CATEGORIES, "Select a category"),
  priority: oneOf(MAINTENANCE_PRIORITIES, "Select a priority"),
  status: oneOf(MAINTENANCE_STATUSES, "Select a status"),
  reportedDate: z.iso.date("Enter the date it was reported"),
  scheduledDate: z.union([z.literal(""), z.iso.date("Enter a valid date")]),
  completedDate: z.union([z.literal(""), z.iso.date("Enter a valid date")]),
  assignedTo: z.string().trim().max(100, "Use 100 characters or fewer"),
  estimatedCost: cost,
  actualCost: cost,
  photos: z.array(z.string()).max(10, "Use 10 photos or fewer"),
  notes: z.string(),
});

export type MaintenanceFormValues = z.infer<typeof MaintenanceFormValidation>;

/** The UTC day of a timestamp, as the date inputs show it. */
const day = (timestamp: string | null) => (timestamp ? timestamp.slice(0, 10) : "");

export const emptyMaintenanceForm = (today: string): MaintenanceFormValues => ({
  propertyId: "",
  renterId: NO_RENTER,
  title: "",
  description: "",
  category: "",
  priority: "medium",
  status: "open",
  reportedDate: today,
  scheduledDate: "",
  completedDate: "",
  assignedTo: "",
  estimatedCost: "",
  actualCost: "",
  photos: [],
  notes: "",
});

const known = (options: readonly { value: string }[], value: string) => (values(options).includes(value) ? value : "");

export function toMaintenanceForm(request: MaintenanceRequest): MaintenanceFormValues {
  const amount = (value: string | null) => (value === null ? "" : String(Number(value)));
  return {
    propertyId: request.propertyId,
    renterId: request.renterId ?? NO_RENTER,
    title: request.title,
    description: request.description,
    // Unknown legacy values are left blank so the user picks a valid one instead of them changing silently.
    category: known(MAINTENANCE_CATEGORIES, request.category),
    priority: known(MAINTENANCE_PRIORITIES, request.priority),
    status: known(MAINTENANCE_STATUSES, request.status),
    reportedDate: day(request.reportedDate),
    scheduledDate: day(request.scheduledDate),
    completedDate: day(request.completedDate),
    assignedTo: request.assignedTo ?? "",
    estimatedCost: amount(request.estimatedCost),
    actualCost: amount(request.actualCost),
    photos: photosOf(request),
    notes: request.notes ?? "",
  };
}

/**
 * Blank optional fields become null, so editing can clear them. When editing, a date whose day did not
 * change keeps the original timestamp, so saving does not drop its time of day.
 */
export function toMaintenanceInput(values: MaintenanceFormValues, original?: MaintenanceRequest): MaintenanceRequestInput {
  const keep = (formDay: string, stored: string | null | undefined) =>
    formDay === "" ? null : stored && day(stored) === formDay ? stored : formDay;
  const orNull = (value: string) => (value.trim() === "" ? null : value.trim());
  const amount = (value: string) => (value.trim() === "" ? null : Number(value));

  return {
    propertyId: values.propertyId,
    renterId: values.renterId === NO_RENTER ? null : values.renterId,
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category,
    priority: values.priority,
    status: values.status,
    reportedDate: keep(values.reportedDate, original?.reportedDate) as string,
    scheduledDate: keep(values.scheduledDate, original?.scheduledDate),
    completedDate: keep(values.completedDate, original?.completedDate),
    assignedTo: orNull(values.assignedTo),
    estimatedCost: amount(values.estimatedCost),
    actualCost: amount(values.actualCost),
    photos: values.photos,
    notes: values.notes.trim() === "" ? null : values.notes,
  };
}
