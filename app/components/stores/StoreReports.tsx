'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'

const REPORT_TYPES = [
  { id: 'SALES', name: 'Sales Report' },
  { id: 'INVENTORY', name: 'Inventory Report' },
  { id: 'PAYMENTS', name: 'Payments Report' },
  { id: 'PROMOTIONS', name: 'Promotions Report' },
] as const

const REPORT_PERIODS = [
  { id: 'DAILY', name: 'Daily' },
  { id: 'WEEKLY', name: 'Weekly' },
  { id: 'MONTHLY', name: 'Monthly' },
  { id: 'YEARLY', name: 'Yearly' },
  { id: 'CUSTOM', name: 'Custom Range' },
] as const

const storeReportSchema = z.object({
  store_id: z.number(),
  report_type: z.enum(['SALES', 'INVENTORY', 'PAYMENTS', 'PROMOTIONS']),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']),
  start_date: z.date(),
  end_date: z.date().optional(),
})

type StoreReportData = z.infer<typeof storeReportSchema>

interface StoreReportsProps {
  stores: { id: number; name: string }[]
  onSubmit: (data: StoreReportData) => void
  initialData?: Partial<StoreReportData>
}

export function StoreReports({
  stores,
  onSubmit,
  initialData,
}: StoreReportsProps) {
  const [showDateRange, setShowDateRange] = useState(
    initialData?.period === 'CUSTOM'
  )

  const form = useForm<StoreReportData>({
    resolver: zodResolver(storeReportSchema),
    defaultValues: {
      store_id: initialData?.store_id || stores[0]?.id,
      report_type: initialData?.report_type || 'SALES',
      period: initialData?.period || 'MONTHLY',
      start_date: initialData?.start_date || new Date(),
      end_date: initialData?.end_date,
    },
  })

  const watchPeriod = form.watch('period')

  // Update date range visibility when period changes
  useState(() => {
    setShowDateRange(watchPeriod === 'CUSTOM')
  }, [watchPeriod])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="store_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="report_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Report Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Period</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REPORT_PERIODS.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showDateRange && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button type="submit">Generate Report</Button>
      </form>
    </Form>
  )
}
