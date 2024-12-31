
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import useWeightStore from "@/store/weight"

// TODO: fix type
interface EditFormProps {
  // data: Row<TData>[] | null;  // Accepting selected row data
  data: any | null;
  db: any// Accepting selected row data,
}

export function EditForm({ data, db }: EditFormProps) {
  const [open, setOpen] = React.useState(false)

  const updateWeight = useWeightStore((state) => state.updateWeight)

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

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      weight: undefined,
      date: undefined,
    },
  })

  // Update form values when `data` changes
  React.useEffect(() => {
    if (data[0]) {
      form.reset({
        weight: data[0].original.weight ?? undefined,
        date: new Date(data[0].original.date) ?? undefined,
      })
    }
  }, [data, form])

  // if (isDesktop) {
  //   return (
  //     <Dialog open={open} onOpenChange={setOpen}>
  //       <DialogTrigger asChild>
  //         <Button variant="outline">Edit Profile</Button>
  //       </DialogTrigger>
  //       <DialogContent className="sm:max-w-[425px]">
  //         <DialogHeader>
  //           <DialogTitle>Edit profile</DialogTitle>
  //           <DialogDescription>
  //             Make changes to your profile here. Click save when you're done.
  //           </DialogDescription>
  //         </DialogHeader>
  //         <ProfileForm />
  //       </DialogContent>
  //     </Dialog>
  //   )
  // }

  async function onSubmit(editData: z.infer<typeof FormSchema>) {
    // Update the data in the database
    if (db) {
      try {
        await db.execute(
          `
      UPDATE weights
      SET weight = ?, date = ?
      WHERE id = ?
    `,
          [editData.weight, editData.date, data[0].original.id] // Assuming `data.id` uniquely identifies the record
        );


        toast({
          title: "Data Updated",
          description: "Your weight data has been successfully updated in the database.",
        });

        const updatedWeight = {
          id: data[0].original.id,
          weight: editData.weight,
          date: editData.date,
        };

        updateWeight(updatedWeight)

        setOpen(false)

        // Update the weight in the parent component's state
        // updateWeight(updatedWeight); // Make sure to implement this in the parent component

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
  const isDisabled = data === undefined || data === null || data.length > 1 || data.length == 0;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" disabled={isDisabled} size="sm">Edit Profile</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="">
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
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
                            " pl-3 text-left font-normal",
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

