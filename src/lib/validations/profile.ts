import { z } from "zod"

export const profileFormSchema = z.object({
  username: z.string().min(3).max(20),
  psnName: z.string().min(3).max(20),
  email: z.string().email(),
  // Add any other fields that are part of your profile form
})