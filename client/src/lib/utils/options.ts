/** The label of a select option, or the raw value when it is not one of the options. */
export const labelOf = (options: readonly { value: string, label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value
