'use client'

import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import React, { createContext, useContext, useEffect, useState } from "react"

import {
    Command,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import DefaultSidebar from "@/components/app/guarded/default-sidebar"
import DefaultBreadcrumb from "@/components/app/guarded/default-breadcrumb"
import LoadingSidebar from "@/components/app/guarded/loading-sidebar"
import TaskManagementSidebar from "@/components/app/guarded/task-management/sidebar"
import TaskManagementBreadcrumb from "@/components/app/guarded/task-management/breakcrumb"
import DashboardSidebar from "@/components/app/guarded/dashboard/sidebar"
import DashboardBreadcrumb from "@/components/app/guarded/dashboard/breadcrumb"

export type AppGuardedContextStatesType = {
    isLoadingSidebar: boolean
    isLoadingBreadcrumb: boolean
    sidebarContent: React.ReactNode
    breadcrumbContent: React.ReactNode
    openCreateTaskQuickForm: boolean
}

export type AppGuardedContextType = {
    appGuardedStates: AppGuardedContextStatesType
    setAppGuardedStates: React.Dispatch<React.SetStateAction<AppGuardedContextStatesType>>
}

const defaultAppContextState: AppGuardedContextStatesType = {
    isLoadingSidebar: true,
    isLoadingBreadcrumb: true,
    sidebarContent: null,
    breadcrumbContent: null,
    openCreateTaskQuickForm: false
}

export const AppGuardedContext = createContext<AppGuardedContextType>({
    appGuardedStates: defaultAppContextState,
    setAppGuardedStates: () => { },
})
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
}
export default function AppGuardedProvider({ children }: {
    children: React.ReactNode
}) {
    const [appGuardedStates, setAppGuardedStates] = useState(defaultAppContextState);
    const pathname = usePathname()
    useEffect(() => {
        if (pathname.startsWith("/dashboard")) {
            setAppGuardedStates({
                isLoadingSidebar: false,
                isLoadingBreadcrumb: false,
                sidebarContent: <DashboardSidebar />,
                breadcrumbContent: <DashboardBreadcrumb />,
                openCreateTaskQuickForm: false
            })
        } else if (pathname.startsWith("/task-management")) {
            setAppGuardedStates({
                isLoadingSidebar: false,
                isLoadingBreadcrumb: false,
                sidebarContent: <TaskManagementSidebar />,
                breadcrumbContent: <TaskManagementBreadcrumb />,
                openCreateTaskQuickForm: false,
            })
        } else {
            setAppGuardedStates({
                isLoadingSidebar: false,
                isLoadingBreadcrumb: false,
                sidebarContent: <DefaultSidebar />,
                breadcrumbContent: <DefaultBreadcrumb />,
                openCreateTaskQuickForm: false,
            })
        }
    }, [pathname])



    return <AppGuardedContext.Provider value={{ appGuardedStates, setAppGuardedStates }}>
        <SidebarProvider>
            <Sidebar variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <a href="#">
                                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                        <Command className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">Acme Incaaa</span>
                                        <span className="truncate text-xs">Enterprise</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    {appGuardedStates.isLoadingSidebar
                        ? <LoadingSidebar />
                        : appGuardedStates.sidebarContent}
                </SidebarContent>
                <SidebarFooter>
                    <NavUser user={data.user} />
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        {appGuardedStates.breadcrumbContent}
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    </AppGuardedContext.Provider>
}

export const useAppGuardedContext = () => {
    const context = useContext(AppGuardedContext)
    if (!context) {
        throw new Error("useAppGuardedContext must be used within a AppGuardedProvider")
    }
    return context
};