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
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

const OPERATIONS = [
  { id: 'CASH_IN', label: 'Cash In' },
  { id: 'CASH_OUT', label: 'Cash Out' },
  { id: 'REFUND', label: 'Refund' },
  { id: 'VOID', label: 'Void Transaction' },
] as const

const storeCashRegisterSchema = z.object({
  store_id: z.number(),
  cash_register_id: z.number(),
  settings: z.object({
    opening_balance: z.number().min(0),
    max_transaction: z.number().min(0),
    allowed_operations: z.array(z.string()),
    requires_approval: z.boolean(),
    auto_close: z.boolean(),
    close_time: z.string().optional(),
  }),
})

type StoreCashRegisterData = z.infer<typeof storeCashRegisterSchema>

interface StoreCashRegisterSettingsProps {
  stores: { id: number; name: string }[]
  cashRegisters: { id: number; local_name: string }[]
  onSubmit: (data: StoreCashRegisterData) => void
  initialData?: Partial<StoreCashRegisterData>
}

export function StoreCashRegisterSettings({
  stores,
  cashRegisters,
  onSubmit,
  initialData,
}: StoreCashRegisterSettingsProps) {
  const form = useForm<StoreCashRegisterData>({
    resolver: zodResolver(storeCashRegisterSchema),
    defaultValues: {
      store_id: initialData?.store_id || stores[0]?.id,
      cash_register_id: initialData?.cash_register_id,
      settings: {
        opening_balance: initialData?.settings?.opening_balance || 0,
        max_transaction: initialData?.settings?.max_transaction || 0,
        allowed_operations: initialData?.settings?.allowed_operations || [
          'CASH_IN',
          'CASH_OUT',
        ],
        requires_approval: initialData?.settings?.requires_approval ?? false,
        auto_close: initialData?.settings?.auto_close ?? false,
        close_time: initialData?.settings?.close_time || '23:00',
      },
    },
  })

  const watchAutoClose = form.watch('settings.auto_close')

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
          name="cash_register_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cash Register</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cash register" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cashRegisters.map((register) => (
                    <SelectItem
                      key={register.id}
                      value={register.id.toString()}
                    >
                      {register.local_name}
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
          name="settings.opening_balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opening Balance</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="settings.max_transaction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Transaction Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="settings.allowed_operations"
          render={() => (
            <FormItem>
              <FormLabel>Allowed Operations</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {OPERATIONS.map((operation) => (
                  <FormField
                    key={operation.id}
                    control={form.control}
                    name="settings.allowed_operations"
                    render={({ field }) => (
                      <FormItem
                        key={operation.id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(operation.id)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              const updated = checked
                                ? [...current, operation.id]
                                : current.filter(
                                    (value) => value !== operation.id
                                  )
                              field.onChange(updated)
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {operation.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="settings.requires_approval"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Requires Approval</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="settings.auto_close"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Auto Close</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {watchAutoClose && (
          <FormField
            control={form.control}
            name="settings.close_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Close Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit">Save Settings</Button>
      </form>
    </Form>
  )
}
