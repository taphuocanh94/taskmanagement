'use server'

import { prisma } from "@/lib/db-client";

export async function userCan(
    userId: string,
    permissionName: string,
    scopeType: 'GLOBAL' | 'WORKSPACE' | 'TASK',
    scopeId?: string
): Promise<boolean> {
    if (!userId || !permissionName) return false

    const hasAdminRole = await prisma.userRole.count({
        where: {
            userId,
            role: {
                name: 'ADMIN',
                scope: scopeType,
            },
        },
    })

    if (hasAdminRole) {
        return true
    }

    // 1. Kiểm tra Custom Permission trực tiếp gán cho User
    const directPermission = await prisma.userPermission.findFirst({
        where: {
            userId,
            permission: {
                name: permissionName,
                scope: scopeType,
            },
        },
    })

    if (directPermission) {
        return true
    }

    // 2. Kiểm tra thông qua Role
    let roles: { roleId: string }[] = []

    if (scopeType === 'GLOBAL') {
        roles = await prisma.userRole.findMany({
            where: {
                userId,
                role: {
                    rolePermissions: {
                        some: {
                            permission: {
                                name: permissionName,
                                scope: scopeType,
                            }
                        }
                    }
                }
            }
        })
    } else if (scopeType === 'WORKSPACE') {
        if (!scopeId) return false
        roles = await prisma.userWorkspaceRole.findMany({
            where: {
                userId,
                workspaceId: scopeId,
            },
            select: {
                roleId: true,
            },
        })
    } else if (scopeType === 'TASK') {
        if (!scopeId) return false
        roles = await prisma.userTaskRole.findMany({
            where: {
                userId,
                taskId: scopeId,
            },
            select: {
                roleId: true,
            },
        })
    }

    if (roles.length === 0) {
        return false
    }

    const roleIds = roles.map(r => r.roleId)

    // 3. Kiểm tra Role có chứa Permission này không
    const rolePermission = await prisma.rolePermission.findFirst({
        where: {
            roleId: { in: roleIds },
            permission: {
                name: permissionName,
                scope: scopeType,
            },
        },
    })

    return !!rolePermission
}