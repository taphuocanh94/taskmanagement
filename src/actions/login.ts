'use server'

import { prisma } from "@/lib/db-client";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";

export default async function login({
    email,
    password
}: {
    email: string;
    password: string
}): Promise<{
    success: true
} | {
    success: false;
    errorMsg: string;
    errorCode: string;
}> {
    const cookiesStore = await cookies()
    const headersList = await headers()
    const requestedId = headersList.get('x-forwarded-for')
    const useAgent = headersList.get('user-agent')

    if (!email || !email.length) {
        return {
            success: false,
            errorMsg: 'Thông tin đăng nhập không chính xác.',
            errorCode: 'login.email.wrong'
        }
    }

    if (!password || !password.length) {
        return {
            success: false,
            errorMsg: 'Thông tin đăng nhập không chính xác.',
            errorCode: 'login.password.wrong'
        }
    }

    const loginUserbyEmail = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (!loginUserbyEmail) {
        return {
            success: false,
            errorMsg: 'Thông tin đăng nhập không chính xác.',
            errorCode: 'login.email.notexists'
        }
    }

    if (!bcrypt.compareSync(password, loginUserbyEmail.password)) {
        return {
            success: false,
            errorMsg: 'Thông tin đăng nhập không chính xác.',
            errorCode: 'login.password.wrong'
        }
    }

    const newSession = await prisma.userSession.create({
        data: {
            user: {
                connect: {id: loginUserbyEmail.id}
            },
            ipAddress: requestedId || 'unknow',
            rememberMe: false,
            sessionType: "AUTHENTICATED",
            userAgent: useAgent,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        }
    })
    console.log('Login session:', newSession);
    cookiesStore.set({
        name: 'sessionId',
        value: newSession.id,
        httpOnly: true,
        path: '/',
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    })

    return {
        success: true
    }
}