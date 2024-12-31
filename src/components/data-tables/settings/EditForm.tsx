import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import useMetricsStore from "@/store/metrics" // Assuming a metrics store is being used

interface EditFormProps {
  data: any | null; // Selected row data
  db: any; // Database connection
}

export function EditForm({ data, db }: EditFormProps) {
  const [open, setOpen] = React.useState(false)

  const updateMetric = useMetricsStore((state) => state.updateMetric)

  const FormSchema = z.object({
    category: z
      .string({
        required_error: "Category is required.",
      })
      .min(1, "Category cannot be empty."),
    kpi: z
      .string({
        required_error: "KPI is required.",
      })
      .min(1, "KPI cannot be empty."),
    date: z.date(),
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      category: "",
      kpi: "",
      date: new Date(), // Default to today
    },
  })

  // Update form values when `data` changes
  React.useEffect(() => {
    if (data[0]) {
      form.reset({
        category: data[0].original.category ?? "",
        kpi: data[0].original.kpi ?? "",
        date: new Date(data[0].original.date) ?? new Date(), // Use today's date if none
      })
    }
  }, [data, form])

  async function onSubmit(editData: z.infer<typeof FormSchema>) {
    // Update the data in the database
    if (db) {
      try {
        await db.execute(
          `
      UPDATE metrics
      SET category = ?, kpi = ?, date = ?
      WHERE id = ?
    `,
          [editData.category, editData.kpi, editData.date, data[0].original.id]
        );

        toast({
          title: "Data Updated",
          description: "Your metric data has been successfully updated in the database.",
        });

        const updatedMetric = {
          id: data[0].original.id,
          category: editData.category,
          kpi: editData.kpi,
          date: editData.date,
        };

        updateMetric(updatedMetric)

        setOpen(false)
      } catch (error) {
        toast({
          title: "Error",
          description: "There was an issue updating your data.",
          variant: "destructive",
        });
        console.error("Error updating data in the database:", error);
      }
    }
  }

  // Disable condition: data is undefined, null, or greater than 1
  const isDisabled = data === undefined || data === null || data.length > 1 || data.length === 0;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" disabled={isDisabled} size="sm">Edit Metric</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Metric</DrawerTitle>
          <DrawerDescription>
            Make changes to your metric data here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter category"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide the category for the metric.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kpi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter KPI"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Specify the KPI for this category.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Date associated with this metric entry.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">Submit</Button>
          </form>
        </Form>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
