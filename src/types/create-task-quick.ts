import { z } from "zod"

export const createTaskQuickFormSchema = z.object({
  ownerId: z.string().uuid({
    message: 'Owner has been seleted is not right.'
  }),
  workspaceId: z.string().uuid({
    message: 'Workspace has been seleted is not right.'
  }),
  parentTaskId: z.string().uuid({
    message: 'Parent task has been seleted is not right.'
  }).or(z.literal('')),
  rootTaskId: z.string().uuid({
    message: 'Root task has been seleted is not right.'
  }).or(z.literal('')),
  taskName: z.string(),
}).required({
  workspaceId: true
})

export type TCreateTaskQuickForm = z.infer<typeof createTaskQuickFormSchema>