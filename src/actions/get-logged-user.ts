'use server'

import { prisma } from "@/lib/db-client";
import { CLoggedUser, TLoggedUserPayload } from "@/lib/db/transfer/logged-user";
import { loggedUserSelect } from "@/types/prisma-select";
import { cookies } from "next/headers";

export default async function getLoggedUser(): Promise<TLoggedUserPayload | null> {
    const cookiesStore = await cookies();
    const sessionId = cookiesStore.get("sessionId")?.value

    if (!sessionId) {
        return null;
    }

    const session = await prisma.userSession.findUnique({
        where: {
            id: sessionId
        }
    })

    if (!session || !session.userId) {
        return null;
    }

    const loggedUser = await prisma.user.findUnique({
        where: {
            id: session.userId
        },
        select: loggedUserSelect
    })
    console.log("loggedUser", loggedUser)

    return (new CLoggedUser(loggedUser)).toJSON()
}