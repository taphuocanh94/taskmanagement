import getUserWorkspaces from "@/actions/get-user-workspaces"
import TaskManagementProvider from "@/components/app/guarded/task-management/task-management-provider"

export default async function TaskManagementLayout({
    children
}: {
    children: React.ReactNode
}) {
    const resultGetWorkspaces = await getUserWorkspaces()
    console.log("resultGetWorkspaces",resultGetWorkspaces)
    if (resultGetWorkspaces.success === true && resultGetWorkspaces.data) {
        return <TaskManagementProvider initWorkspaces={resultGetWorkspaces.data}>{children}</TaskManagementProvider>
    } else {
        return <TaskManagementProvider initWorkspaces={[]}>{children}</TaskManagementProvider>
    }
}