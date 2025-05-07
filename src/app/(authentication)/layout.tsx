import getLoggedUser from "@/actions/get-logged-user";
import { redirect } from "next/navigation";

export default async function AuthenticationLayout({
    children
}: {
    children: React.ReactNode
}) {
    const loggedUser = await getLoggedUser();
    if (!loggedUser) {
        return <>{children}</>
    } else {
        redirect('/dashboard')
    }
}