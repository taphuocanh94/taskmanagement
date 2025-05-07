"use client"

import { useState } from "react"

import { ChevronRight, PlusCircle } from "lucide-react"
import { translate, useAuthenticatedAppContext } from '@/app/app-provider';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { tmpCreateTaskQuickForm } from "@/components/app/guarded/task-management/create-task-quick-form";
import { useAppGuardedContext } from "@/components/app/guarded/app-guarded-provider";
import getTasks from "@/actions/get-tasks";

function NavWorkspaceItem({ workspaceId }: { workspaceId: string }) {
    const { appStates, setAppStates } = useAuthenticatedAppContext()
    const { setAppGuardedStates } = useAppGuardedContext()
    const [workspaceItemState, setWorkspaceItemState] = useState<{
        isLoadingProjects: boolean;
        canAddNewProject: boolean;
        isNavigating: boolean;
    }>({
        isLoadingProjects: true,
        canAddNewProject: false,
        isNavigating: true
    })
    const currentWorkspace = appStates.workspaces[workspaceId]
    const loadProjects = async () => {
        if (workspaceItemState.isLoadingProjects) {
            await new Promise((resolve) => setTimeout(resolve, 300))
            const rootTasksLoaded = await getTasks({
                workspaceId: workspaceId,
                rootTaskId: '',
                parentTaskId: '',
            })
            if (rootTasksLoaded.success) {
                appStates.workspaces[workspaceId].rootTasks = rootTasksLoaded.data
            } else {
                appStates.workspaces[workspaceId].rootTasks = []
            }
            console.log(appStates.workspaces[workspaceId].rootTasks)
            setAppStates({ type: 'SET_WORKSPACES', payload: { ...appStates.workspaces } })

            setWorkspaceItemState({
                isLoadingProjects: false,
                // projects: item.items,
                canAddNewProject: true,
                isNavigating: false
            })
        }
    }

    const showCreateTaskQuickForm = () => {
        tmpCreateTaskQuickForm.workspaceId = workspaceId
        tmpCreateTaskQuickForm.ownerId = appStates.user.id
        console.log("showCreateTaskQuickForm", "click")
        setAppGuardedStates((prevStates) => {
            return { ...prevStates, openCreateTaskQuickForm: true }
        })
    }

    return <Collapsible asChild defaultOpen={currentWorkspace.isActive}>
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={currentWorkspace.name}>
                <Link href={currentWorkspace.url}>
                    {
                        typeof currentWorkspace.icon === "string" ? (
                            <Image src={currentWorkspace.icon} alt={currentWorkspace.name} width={16} height={16} />
                        ) : (
                            <currentWorkspace.icon />
                        )
                    }
                    <span>{currentWorkspace.name}</span>
                </Link>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:rotate-90" onClick={loadProjects}>
                    <ChevronRight />
                    <span className="sr-only">Toggle</span>
                </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SidebarMenuSub>
                    {
                        workspaceItemState.isLoadingProjects
                            ?
                            Array.from(Array(3).keys()).map(i => {
                                return <div key={i} className="flex flex-row items-center gap-3 p-1">
                                    {/* <Skeleton className="h-4 w-6 bg-gray-300 rounded" /> */}
                                    <Skeleton className="h-4 w-[150px] bg-gray-300" />
                                </div>
                            })
                            : currentWorkspace.rootTasks.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.id}>
                                    <SidebarMenuSubButton asChild>
                                        <Link href={subItem.url}>
                                            <span>{subItem.title}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))
                    }

                    {!workspaceItemState.isLoadingProjects && workspaceItemState.canAddNewProject && <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                            <Button variant="outline" onClick={showCreateTaskQuickForm}>
                                <PlusCircle /><span>Add new project</span>
                            </Button>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>}
                </SidebarMenuSub>
            </CollapsibleContent>
        </SidebarMenuItem>
    </Collapsible>
}

export function NavWorkpsaces({
    isLoading
}: {
    isLoading: boolean
}) {

    const { appStates } = useAuthenticatedAppContext()

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{translate('app.guarded.sidebar.task-management.nav-workspaces.sidebar-group-label')}</SidebarGroupLabel>
            <SidebarMenu>
                {isLoading
                    ? Array.from(Array(3).keys()).map(i => {
                        return <div key={i} className="flex flex-row items-center gap-3 p-1">
                            <Skeleton className="h-4 w-6 bg-gray-300 rounded" />
                            <Skeleton className="h-4 w-[200px] bg-gray-300" />
                        </div>
                    })
                    : Object.keys(appStates.workspaces).map((workspaceId) => (
                        <NavWorkspaceItem key={workspaceId} workspaceId={workspaceId} />
                    ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
