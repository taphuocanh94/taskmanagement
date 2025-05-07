'use server'

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db-client";

export default async function getTasks({
    workspaceId,
    rootTaskId,
    parentTaskId,
    skip,
    take
}: {
    workspaceId: string;
    rootTaskId: string;
    parentTaskId: string;
    skip?: number;
    take?: number;   
}): Promise<TResponse<{
    id: string;
    title: string;
    url: string;
    workspaceId: string;
    rootTaskId: string;
    parentTaskId: string;
}[], string>> {
    if (!workspaceId) {
        return {
            success: false,
            code: 4001,
            msg: 'Don\'t have workspaceId'
        }
    }

    const query: Prisma.TaskFindManyArgs = {
        where: {
            workspaceId
        }
        // , select: {
        //     rootId: true,
        //     parentId: true
        // }
    }

    if (workspaceId.length) {
        query.where = {...query.where, workspaceId}
    }

    if (rootTaskId.length) {
        query.where = {...query.where, rootId: rootTaskId}
    }

    if (parentTaskId.length) {
        query.where = {...query.where, parentId: parentTaskId}
    }

    if (skip) {
        query.skip = skip
    }

    if (take) {
        query.take = take
    }

    const tasks = await prisma.task.findMany(query)
    if (!tasks) {
        return {
            success: true,
            data: []
        }
    }

    
    return {
        success: true,
        data: tasks.map(task => ({
            id: task.id,
            title: task.title,
            url: '/task-management/task/' + task.id,
            workspaceId: task.workspaceId,
            rootTaskId: task.rootId || '',
            parentTaskId: task.parentId || '',
        }))
    }
}