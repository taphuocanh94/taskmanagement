import getLoggedUser from "@/actions/get-logged-user"
import { redirect } from "next/navigation"
import AppGuardedProvider from "../../components/app/guarded/app-guarded-provider"


export default async function GuardedLayout({
    children,
}: {
    children: React.ReactNode
    breadcrumb: React.ReactNode
    sidebar: React.ReactNode
}) {    
    const loggedUser = await getLoggedUser(); 
    console.log('guarded layout', loggedUser)
    if (!loggedUser) {
        redirect("/login")
    } else {
        return (
            <AppGuardedProvider>
                {children}
            </AppGuardedProvider>
        )
    }
}