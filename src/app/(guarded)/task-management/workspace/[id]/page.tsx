'use client'
import { AppContext } from "@/app/app-provider"
import { useContext, useEffect } from "react"

export default function TaskManagementPage() {
    const { appStates, setAppStates } = useContext(AppContext)
    useEffect(() => {
        if (appStates.appLoading) {
            setAppStates({ type: 'LOADING' as const, payload: false })
        }
    })
    return <>Task management/ Workspace page</>
}