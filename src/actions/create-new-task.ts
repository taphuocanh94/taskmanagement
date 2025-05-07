'use server'

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db-client";
import { createTaskQuickFormSchema, TCreateTaskQuickForm } from "@/types/create-task-quick";



export default async function createNewTask(formData: TCreateTaskQuickForm): Promise<TResponse<{
    id: string;
    title: string;
    url: string;
    workspaceId: string;
    rootTaskId: string;
    parentTaskId: string;
}, {
    ownerId?: string[] | undefined;
    workspaceId?: string[] | undefined;
    parentTaskId?: string[] | undefined;
    rootTaskId?: string[] | undefined;
    taskName?: string[] | undefined;
}>> {
    const validatedFields = createTaskQuickFormSchema.safeParse({
        ownerId: formData.ownerId,
        workspaceId: formData.workspaceId,
        parentTaskId: formData.parentTaskId,
        rootTaskId: formData.rootTaskId,
        taskName: formData.taskName,
    })

    // Return early if the form data is invalid
    if (!validatedFields.success) {
        console.log(validatedFields.error)
        return {
            success: false,
            code: 2003,
            msg: {...validatedFields.error.flatten().fieldErrors}
        }
    }

    const dataTaskToCreate: Prisma.TaskCreateInput = {
        title: validatedFields.data.taskName,
        owner: {
            connect: {
                id: validatedFields.data.ownerId
            }
        },
        workspace: {
            connect: {
                id: validatedFields.data.workspaceId
            }
        }
    }

    if (validatedFields.data.rootTaskId.length) {
        dataTaskToCreate.root = {
            connect: {
                id: validatedFields.data.rootTaskId
            }
        }
    }

    if (validatedFields.data.parentTaskId.length) {
        dataTaskToCreate.root = {
            connect: {
                id: validatedFields.data.parentTaskId
            }
        }
    }

    const toDoStage = await prisma.taskStage.findFirst({
        where: {
            name: "To Do",
            workspaces: {
                some: {
                    workspace: {
                        id: validatedFields.data.workspaceId
                    }
                }
            }
        }
    })
    console.log(toDoStage)
    if (toDoStage) {
        dataTaskToCreate.stage = {
            connect: {
                id: toDoStage.id
            }
        }
    }

    const newTask = await prisma.task.create({
        data: dataTaskToCreate
    })

    return {
        success: true,
        data: {
            id: newTask.id,
            title: newTask.title,
            url: '/task-management/task/' + newTask.id,
            workspaceId: validatedFields.data.workspaceId,
            rootTaskId: validatedFields.data.rootTaskId,
            parentTaskId: validatedFields.data.parentTaskId,
        }
    }
}