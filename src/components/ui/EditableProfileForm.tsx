import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { profileFormSchema } from "@/lib/validations/profile"

function EditableProfileForm({
    form,
    onSubmit,
    avatarPreview,
    handleAvatarChange,
  }: {
    form: ReturnType<typeof useForm<z.infer<typeof profileFormSchema>>>
    onSubmit: (values: z.infer<typeof profileFormSchema>) => void
    avatarPreview: string
    handleAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  }) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* ... avatar input ... */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="text-yellow-400">Username</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-purple-700 text-white border-purple-600" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="psnName"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="text-yellow-400">PSN Name (not public)</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-purple-700 text-white border-purple-600" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="text-yellow-400">Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" className="bg-purple-700 text-white border-purple-600" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ... buttons ... */}
        </form>
      </Form>
    )
  }

export default EditableProfileForm