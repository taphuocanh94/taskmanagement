'use client'
import { useTaskManagementContext } from "../../../components/app/guarded/task-management/task-management-provider"

export default function DashboardPage() {
    const {taskManagementStates} = useTaskManagementContext()
    console.log('Page taskmanagement', taskManagementStates)
    return <>Task management dashboard page</>
}