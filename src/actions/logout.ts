'use server'

import { prisma } from "@/lib/db-client"
import { redirect } from "next/navigation"
import { cookies, headers } from "next/headers"

export default async function logout() {
    const cookiesStore = await cookies()
    const headersList = await headers()
    const requestedId = headersList.get('x-forwarded-for')
    const useAgent = headersList.get('user-agent')

    
    const sessionId = cookiesStore.get("sessionId")?.value// bạn tự xử lý auth/token ở đây

    if (!sessionId) {
    
        cookiesStore.set({
            name: 'sessionId',
            value: "",
            httpOnly: true,
            path: '/',
            expires: 0, // 1 hour
        })
        redirect('/')
    }
    
    const requestedLogoutSession = {
        id: sessionId,
        userAgent: useAgent,
        ipAddress: requestedId ? requestedId : 'unknow'
    }

    const session = await prisma.userSession.findUnique({
        where: requestedLogoutSession
    })

    if (!session) {
    
        cookiesStore.set({
            name: 'sessionId',
            value: "",
            httpOnly: true,
            path: '/',
            expires: 0, // 1 hour
        })
        redirect('/')
    }
    
    await prisma.userSession.update({
        where: requestedLogoutSession,
        data: {
            revoked: true
        }
    })

    cookiesStore.set({
        name: 'sessionId',
        value: "",
        httpOnly: true,
        path: '/',
        expires: 0, // 1 hour
    })
    redirect('/')

}