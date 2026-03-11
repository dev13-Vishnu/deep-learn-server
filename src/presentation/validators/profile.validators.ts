import { z } from 'zod';


export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName:  z.string().optional(),
  bio:       z.string().optional(),
});