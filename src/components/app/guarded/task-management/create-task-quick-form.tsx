'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAppGuardedContext } from "@/components/app/guarded/app-guarded-provider"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createTaskQuickFormSchema, TCreateTaskQuickForm } from "@/types/create-task-quick"
import createNewTask from "@/actions/create-new-task"
import { useAuthenticatedAppContext } from "@/app/app-provider"


export const tmpCreateTaskQuickForm: TCreateTaskQuickForm = {
  ownerId: '',
  workspaceId: '',
  parentTaskId: '',
  rootTaskId: '',
  taskName: ''
}

export function CreateTaskQuickForm() {
  const { appStates, setAppStates } = useAuthenticatedAppContext()
  const { appGuardedStates, setAppGuardedStates } = useAppGuardedContext();
  // 1. Define your form.
  const form = useForm<TCreateTaskQuickForm>({
    resolver: zodResolver(createTaskQuickFormSchema),
    defaultValues: {
      workspaceId: "",
      taskName: ""
    },
    values: {
      ownerId: tmpCreateTaskQuickForm.ownerId,
      workspaceId: tmpCreateTaskQuickForm.workspaceId,
      parentTaskId: tmpCreateTaskQuickForm.parentTaskId ? tmpCreateTaskQuickForm.parentTaskId : "",
      rootTaskId: tmpCreateTaskQuickForm.rootTaskId ? tmpCreateTaskQuickForm.rootTaskId : "",
      taskName: "",
    }
  })

  

  // 2. Define a submit handler.
  async function onSubmit(values: TCreateTaskQuickForm) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    const newTask = await createNewTask(values)
    console.log('newTask', newTask)
    if (newTask.success === true as const) {
      if (!newTask.data.rootTaskId || !newTask.data.rootTaskId.length) {
        appStates.workspaces[newTask.data.workspaceId].rootTasks.push({
          id: newTask.data.id,
          title: newTask.data.title,
          url: '/task-management/task/'+newTask.data.id
        })
        setAppStates({ type: 'SET_WORKSPACES', payload: { ...appStates.workspaces } })
        appGuardedStates.openCreateTaskQuickForm = false
      }
    }
  }
  return (
    <Dialog open={appGuardedStates.openCreateTaskQuickForm} onOpenChange={(state) => setAppGuardedStates((prevStates) => {
      return { ...prevStates, openCreateTaskQuickForm: state }
    })}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create new object</DialogTitle>
              <DialogDescription>
                Anyone who has this link will be able to view this.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">

                <FormField
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <Input type="hidden" {...field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="workspaceId"
                  render={({ field }) => (
                    <Input type="hidden" {...field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentTaskId"
                  render={({ field }) => (
                    <Input type="hidden" {...field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="rootTaskId"
                  render={({ field }) => (
                    <Input type="hidden" {...field} />
                  )}
                />

                <FormField
                  control={form.control}
                  name="taskName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>This is task&#39;s public display name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button type="submit">Create</Button>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}