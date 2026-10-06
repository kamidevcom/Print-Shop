"use client";

import { useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { cn } from "@/lib/utils";

type PersianDatePickerProps = {
  name: string;
  id?: string;
  defaultValue?: string | Date | null;
  className?: string;
};

function toDateObject(value?: string | Date | null) {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return new DateObject({ date, calendar: persian, locale: persian_fa });
}

function toFormValue(date: DateObject | null) {
  if (!date) return "";
  const jsDate = date.toDate();
  const offset = jsDate.getTimezoneOffset();
  const local = new Date(jsDate.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function PersianDatePicker({ name, id, defaultValue, className }: PersianDatePickerProps) {
  const [value, setValue] = useState<DateObject | null>(() => toDateObject(defaultValue));
  const [formValue, setFormValue] = useState(() => toFormValue(toDateObject(defaultValue)));

  return (
    <div className="chap-datepicker w-full">
      <input type="hidden" name={name} value={formValue} readOnly />
      <DatePicker
        id={id}
        calendar={persian}
        locale={persian_fa}
        value={value}
        format="YYYY/MM/DD HH:mm"
        calendarPosition="bottom-right"
        portal
        plugins={[<TimePicker key="time" position="bottom" hideSeconds />]}
        containerClassName="w-full"
        inputClass={cn(
          "h-11 w-full rounded-xl border border-border bg-bg-elevated px-3.5 text-sm text-text outline-none transition placeholder:text-text-dim focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
          className,
        )}
        placeholder="انتخاب تاریخ تحویل"
        onChange={(date: DateObject | DateObject[] | null) => {
          const single = Array.isArray(date) ? date[0] ?? null : date;
          setValue(single);
          setFormValue(toFormValue(single));
        }}
      />
    </div>
  );
}
