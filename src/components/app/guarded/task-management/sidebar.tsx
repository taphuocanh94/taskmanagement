"use client"

import * as React from "react"
import {
    ArrowLeft,
    BookOpen,
    Bot,
    Frame,
    LifeBuoy,
    Map,
    PieChart,
    Send,
    Settings2,
    SquareTerminal,
    FolderClosed,
} from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { NavWorkpsaces } from "@/components/app/guarded/task-management/sidebar/nav-workspaces"
import { useAuthenticatedAppContext } from "@/app/app-provider"
import Link from "next/link"

const data = {
    navMain: [
        {
            title: "Playground",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: "History",
                    url: "#",
                },
                {
                    title: "Starred",
                    url: "#",
                },
                {
                    title: "Settings",
                    url: "#",
                },
            ],
        },
        {
            title: "Models",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "Genesis",
                    url: "#",
                },
                {
                    title: "Explorer",
                    url: "#",
                },
                {
                    title: "Quantum",
                    url: "#",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Support",
            url: "#",
            icon: LifeBuoy,
        },
        {
            title: "Feedback",
            url: "#",
            icon: Send,
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Travel",
            url: "#",
            icon: Map,
        },
    ],
}

export default function TaskManagementSidebar() {
    const { appStates } = useAuthenticatedAppContext()
    const [sidebarStates, setSidebarStates] = React.useState<{
        isLoadingWorkspaces: boolean,
        workspaces: TWorkspaceMenuItem[]
    }>({
        isLoadingWorkspaces: true,
        workspaces: []
    })

    React.useEffect(() => {
        if (typeof appStates.workspaces !== "undefined") {
            setSidebarStates({
                isLoadingWorkspaces: false,
                workspaces: Object.keys(appStates.workspaces).map((workspaceId) => {
                    const workspace = appStates.workspaces[workspaceId]
                    return {
                        id: workspaceId,
                        title: workspace.name,
                        url: `/task-management/workspace/${workspaceId}`,
                        icon: workspace.icon || FolderClosed,
                        isActive: false,
                        items: workspace.rootTasks.map(task => ({
                            id: task.id,
                            title: task.title,
                            url: `/task-management/task/${task.id}`
                        })),
                    }
                })
            })
        }
    }, [appStates.workspaces])

    return (
        <>
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                <SidebarMenu>
                    <SidebarMenuItem key={"dashboard-page"}>
                        <SidebarMenuButton asChild>
                            <Link href={"/dashboard"}>
                                <ArrowLeft />
                                <span>{"Back to Dashboard"}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

            </SidebarGroup>
            <NavWorkpsaces isLoading={sidebarStates.isLoadingWorkspaces} />
            <NavProjects projects={data.projects} />
            <NavSecondary items={data.navSecondary} className="mt-auto" />
        </>
    )
}
