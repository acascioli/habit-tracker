import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import useMetricsStore from "@/store/metrics" // Assuming a metrics store is being used
import useDBStore from "@/store/db"

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
  date: z.date(), // Auto-filled, no user input required
})

export function MetricsForm() {
  const addMetric = useMetricsStore((state) => state.addMetric)
  const settingsDB = useDBStore((state) => state.settingsDB)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      category: "",
      kpi: "",
      date: new Date(), // Automatically set to today's date
    },
  })

  // Function to handle form submission
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })

    // Insert the data into the database
    if (settingsDB) {
      try {
        const result = await settingsDB.execute(
          `
    INSERT INTO metrics (category, kpi, date)
    VALUES (?, ?, ?)
    RETURNING id
    `,
          [data.category, data.kpi, data.date]
        );

        const insertedId = result[0]?.id; // Adjust based on the database client structure

        toast({
          title: "Data Inserted",
          description: "Your metric data has been successfully saved to the database.",
        });

        const newMetric = {
          id: insertedId,
          category: data.category,
          kpi: data.kpi,
          date: data.date,
        };

        // Add the new metric to the parent component's state
        addMetric(newMetric);
      } catch (error) {
        toast({
          title: "Error",
          description: "There was an issue saving your data.",
          variant: "destructive",
        });
        console.error("Error inserting data into the database:", error);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter the category"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Please provide the category for the metric.
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
                  placeholder="Enter the KPI"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Please provide the KPI for the metric.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
