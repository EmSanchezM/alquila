import { FC, ReactNode } from "react"
import { Control } from "react-hook-form"

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { FormFieldsTypes } from "@/lib/constants/form-fields-types";

interface FormFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>,
  fieldType: FormFieldsTypes,
  name: string,
  label?: string,
  placeholder?: string,
  iconSrc?: string,
  iconAlt?: string,
  disabled?: boolean,
  dateFormat?: string,
  showTimeSelect?: boolean,
  children?: ReactNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderCustom?: (field: any) => ReactNode,
}

interface RenderFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any,
  props: FormFieldProps,
}

const RenderField: FC<RenderFieldProps> = ({ field, props }) => {
  switch (props.fieldType) {
    case FormFieldsTypes.INPUT:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          {
            props.iconSrc && (
              <img
                src={props.iconSrc}
                alt={props.iconAlt || 'Icon'}
                height={24}
                width={24}
                className="ml-2"
              />
            )
          }
          <FormControl>
            <Input
              placeholder={props.placeholder}
              {...field}
              className="shad-input border-0"
            />
          </FormControl>
        </div>
      )
    case FormFieldsTypes.TEXTAREA:
      return (
        <FormControl>
            <Textarea
              placeholder={props.placeholder}
              {...field}
              className="shad-textArea"
              disabled={props.disabled}
            />
          </FormControl>
      )
    case FormFieldsTypes.PHONE_INPUT:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          <FormControl>
            <PhoneInput
              defaultCountry="HN"
              international
              widthCountryCallingCode
              placeholder={props.placeholder}
              value={field.value}
              onChange={field.onChange}
              className="input-phone"
            />
          </FormControl>
        </div>
      )
    case FormFieldsTypes.SELECT:
      return (
        <FormControl>
          <Select
            defaultValue={field.value}
            onValueChange={field.onChange}
          >
            <FormControl>
              <SelectTrigger className="shad-select-trigger">
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="shad-select-content">
              {props.children}
            </SelectContent>
          </Select>
        </FormControl>
      )
    case FormFieldsTypes.CHECKBOX:
      return (
        <div className="flex items-center gap-4">
          <Checkbox
            id={props.name}
            checked={field.value}
            onCheckedChange={field.onChange}
            {...field}
          />
          <label htmlFor={props.name} className="checkbox-label">{props.label}</label>
        </div>
      )
    case FormFieldsTypes.DATE_PICKER:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          <img 
            src=""
            alt="calendar"
            height={24}
            width={24}
            className="ml-2"
          />
          <FormControl>
            <DatePicker 
              selected={field.value}
              onChange={(date) => field.onChange(date)}
              showTimeSelect={props.showTimeSelect ?? false}
              dateFormat={props.dateFormat ?? 'dd/MM/yyyy'}
              timeInputLabel="Time:"
              wrapperClassName="date-picker"
            />
          </FormControl>
        </div>
      )
    case FormFieldsTypes.CUSTOM:
      return props.renderCustom ? props.renderCustom(field) : null
    default:
      return <Input {...field} />
  }
}

const CustomFormField: FC<FormFieldProps> = (props) => {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {
            props.fieldType !== FormFieldsTypes.CHECKBOX && props.label && (
              <FormLabel>{props.label}</FormLabel>
            )
          }
          <FormControl>
            <RenderField field={field} props={props} />
          </FormControl>
          <FormDescription>This is your public display name.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default CustomFormField