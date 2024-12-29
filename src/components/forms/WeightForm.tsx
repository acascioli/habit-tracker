import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const FormSchema = z.object({
  weight: z
    .number({
      required_error: "Weight is required.",
      invalid_type_error: "Weight must be a number.",
    })
    .positive("Weight must be a positive number.")
    .max(1000, "Weight must be below 1000 kg."),
  date: z.date({
    required_error: "A date is required.",
  }),
})

// Add the db prop to the component type
type WeightFormProps = {
  addWeight: (newWeight: { weight: number; date: Date }) => void; // Function to update parent state
  db: any; // Your DB connection
}

export function WeightForm({ addWeight, db }: WeightFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      weight: undefined,
      date: undefined,
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
    if (db) {
      try {
        await db.execute(`
          INSERT INTO weights (weight, date)
          VALUES (?, ?)
        `, [data.weight, data.date]);
        toast({
          title: "Data Inserted",
          description: "Your weight data has been successfully saved to the database.",
        });

        const newWeight = {
          weight: data.weight,
          date: data.date,
        };

        // Add the new weight to the parent component's state
        addWeight(newWeight);

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter your weight in kilograms"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Please provide your current weight in kilograms.
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
                        "w-[240px] pl-3 text-left font-normal",
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
                Select the date when this weight measurement was taken.
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
