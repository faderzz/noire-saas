"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
})

export function AddUserForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "user",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="dark:text-stone-300">Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="team@example.com" 
                  {...field}
                  className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300"
                />
              </FormControl>
              <FormDescription className="dark:text-stone-400">
                An invitation will be sent to this email address.
              </FormDescription>
              <FormMessage className="dark:text-red-400" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="dark:text-stone-300">Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="dark:bg-stone-800 dark:border-stone-700">
                  <SelectItem value="admin" className="dark:text-stone-300 dark:focus:bg-stone-700">Admin</SelectItem>
                  <SelectItem value="user" className="dark:text-stone-300 dark:focus:bg-stone-700">User</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="dark:text-stone-400">
                Set the user&apos;s role and permissions level.
              </FormDescription>
              <FormMessage className="dark:text-red-400" />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onSuccess()}
            className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="dark:bg-stone-800 dark:text-white dark:hover:bg-stone-700"
          >
            Add Team Member
          </Button>
        </div>
      </form>
    </Form>
  )
}