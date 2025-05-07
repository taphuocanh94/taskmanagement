import { Prisma } from '@/generated/prisma/client';

export const loggedUserSelect: Prisma.UserSelect = {
    id: true,
    email: true,
    name: true,
    ownedWorkspaces: true,
    globalRoles: {
        where: {
            role: {
                scope: 'GLOBAL'
            }
        },
        select: {
            role: {
                select: {
                    name: true,
                    rolePermissions: {
                        where: {
                            role: {
                                scope: 'GLOBAL'
                            }
                        },
                        select: {
                            permission: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
        }
    },
    taskRoles: {
        where: {
            role: {
                scope: 'TASK'
            }
        },
        select: {
            task: true,
            role: {
                select: {
                    name: true,
                    rolePermissions: {
                        where: { // ✅ Đặt where ở đây
                            permission: {
                                scope: 'TASK'
                            }
                        },
                        select: {
                            permission: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
        }
    },
    customPermissions: {
        select: {
            permission: {
                select: {
                    name: true
                }
            }
        }
    },
    workspaceRoles: {
        where: {
            role: {
                scope: 'WORKSPACE'
            }
        },
        select: {
            workspace: true,
            role: {
                select: {
                    name: true,
                    rolePermissions: {
                        where: { // ✅ Đặt where ở đây
                            permission: {
                                scope: 'WORKSPACE'
                            }
                        },
                        select: {
                            permission: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    },
}