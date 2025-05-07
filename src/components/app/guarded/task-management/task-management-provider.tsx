'use client'

import { useAppContext } from "@/app/app-provider"
import { Workspace } from "@/generated/prisma"
import { TWorkspacesMapWithKeyById } from "@/types/prisma"
import { FolderClosed } from "lucide-react"
import { createContext, useContext, useEffect, useState } from "react"
import { CreateTaskQuickForm } from "./create-task-quick-form"

export type TaskManagementContextStatesType = {
    openCreateTaskQuickForm: boolean
}

export type TaskManagementContextType = {
    taskManagementStates: TaskManagementContextStatesType
    setTaskManagementStates: React.Dispatch<React.SetStateAction<TaskManagementContextStatesType>>
}

const defaultAppContextState: TaskManagementContextStatesType = {
    openCreateTaskQuickForm: false
}

export const TaskManagementContext = createContext<TaskManagementContextType>({
    taskManagementStates: defaultAppContextState,
    setTaskManagementStates: () => { },
})

export default function TaskManagementProvider({ children, initWorkspaces }: {
    children: React.ReactNode
    initWorkspaces: Workspace[]
}) {
    const [taskManagementStates, setTaskManagementStates] = useState({
        openCreateTaskQuickForm: false
    });
    const { setAppStates } = useAppContext()
    useEffect(() => {
        console.log('task management provider loading workspace')
        const workspaces = initWorkspaces.reduce<TWorkspacesMapWithKeyById>((acc, workspace) => {
            const { id, ...rest } = workspace;
            acc[id] = {...rest, rootTasks: [], url: '/task-management/workspace/' + id, isActive: false, icon: rest.icon || FolderClosed};
            return acc;
        }, {});

        setAppStates({ type: 'SET_WORKSPACES', payload: workspaces })
    }, [initWorkspaces]);

    useEffect(() => {
        console.log("taskManagementStates.openCreateTaskQuickForm", taskManagementStates.openCreateTaskQuickForm)
    }, [taskManagementStates.openCreateTaskQuickForm]) 
    return <TaskManagementContext.Provider value={{ taskManagementStates, setTaskManagementStates }}>
        {children}
        <CreateTaskQuickForm />
    </TaskManagementContext.Provider>
}

export const useTaskManagementContext = () => {
    const context = useContext(TaskManagementContext)
    console.log('useTaskManagementContext', context)
    if (!context) {
        throw new Error("useTaskManagementContext must be used within a TaskManagementProvider")
    }
    return context
};
