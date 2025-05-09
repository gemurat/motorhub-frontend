'use client'

import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const storePaymentMethodSchema = z.object({
  store_id: z.number(),
  payment_method_id: z.number(),
  is_active: z.boolean(),
})

type StorePaymentMethodData = z.infer<typeof storePaymentMethodSchema>

interface StorePaymentMethodsProps {
  stores: { id: number; name: string }[]
  paymentMethods: { id: number; name: string; requires_approval: boolean }[]
  onSubmit: (data: StorePaymentMethodData) => void
  initialData?: Partial<StorePaymentMethodData>
}

export function StorePaymentMethods({
  stores,
  paymentMethods,
  onSubmit,
  initialData,
}: StorePaymentMethodsProps) {
  const form = useForm<StorePaymentMethodData>({
    resolver: zodResolver(storePaymentMethodSchema),
    defaultValues: {
      store_id: initialData?.store_id || stores[0]?.id,
      payment_method_id: initialData?.payment_method_id,
      is_active: initialData?.is_active ?? true,
    },
  })

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
          name="payment_method_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id.toString()}>
                      {method.name}{' '}
                      {method.requires_approval ? '(Requires Approval)' : ''}
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
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
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

        <Button type="submit">Save Payment Method</Button>
      </form>
    </Form>
  )
}
