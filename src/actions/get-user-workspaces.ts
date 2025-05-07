'use server'

import { prisma } from "@/lib/db-client";
import { cookies } from "next/headers";
import { userCan } from "./auth/use-can";

export default async function getUserWorkspaces(userId?: string) {
    const cookiesStore = await cookies();
    const sessionId = cookiesStore.get("sessionId")?.value

    if (!sessionId) {
        return {
            success: false,
            code: '0001',
            msg: 'Not Login'
        };
    }

    const session = await prisma.userSession.findUnique({
        where: {
            id: sessionId
        }
    })

    if (!session || !session.userId) {
        return {
            success: false,
            code: '0001',
            msg: 'Not Login'
        };
    }

    if (!userId) {
        userId = session.userId
    }
    
    if ((userId == session.userId && await userCan(userId, "WORKSPACE__LIST", "GLOBAL")) || (userId != session.userId && await userCan(userId, "WORKSPACE__LIST_ALL", "GLOBAL"))) {
        // get workspaces of other user by userId
        const workspaces = await prisma.workspace.findMany({
            where: {
                OR: [
                    {
                        userRoles: {
                            some: {
                                userId: userId
                            }
                        }
                    },
                    {
                        ownerId: userId
                    }
                ]
            }
        })

        return {
            success: true,
            data: workspaces,
        };
    }

    return {
        success: false,
        code: '0003',
        msg: 'Cannot get workspaces'
    };
}