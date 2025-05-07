import { $Enums, Permission, PrismaClient, Role, TaskStage, User } from '../src/generated/prisma/client'
const prisma = new PrismaClient()

// Define the type for the query result
interface Table {
    table_name: string
  }
async function main() {
    const tables = await prisma.$queryRaw<Table[]>`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`; // Adjust if you're using a different schema
  
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`Truncating table: ${tableName}`);
      await prisma.$queryRaw`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`; // Truncate with reset of auto-increment and cascade (to remove foreign key dependencies)
    }
  
    console.log('All tables truncated!');
    const initPermissions = [
        {name: 'AUTH__LOGIN', scope: 'GLOBAL'},
        {name: 'WORKSPACE__CREATE', scope: 'GLOBAL'},
        {name: 'WORKSPACE__PUBLISH', scope: 'GLOBAL'},
        {name: 'WORKSPACE__LIST', scope: 'GLOBAL'},
        {name: 'WORKSPACE__LIST_ALL', scope: 'GLOBAL'},
        {name: 'WORKSPACE__READ', scope: 'WORKSPACE'},
        {name: 'WORKSPACE__READ_OTHER', scope: 'WORKSPACE'},
        {name: 'WORKSPACE__UPDATE', scope: 'WORKSPACE'},
        {name: 'WORKSPACE__UPDATE_OTHER', scope: 'WORKSPACE'},
        {name: 'WORKSPACE__DELETE', scope: 'WORKSPACE'},
        {name: 'WORKSPACE__DELETE_OTHER', scope: 'WORKSPACE'},
        {name: 'TASK__CREATE', scope: 'WORKSPACE'},
        {name: 'TASK__PUBLISH', scope: 'WORKSPACE'},
        {name: 'TASK__LIST', scope: 'WORKSPACE'},
        {name: 'TASK__LIST_ALL', scope: 'WORKSPACE'},
        {name: 'TASK__READ', scope: 'TASK'},
        {name: 'TASK__READ_OTHER', scope: 'TASK'},
        {name: 'TASK__UPDATE', scope: 'TASK'},
        {name: 'TASK__UPDATE_OTHER', scope: 'TASK'},
        {name: 'TASK__DELETE', scope: 'TASK'},
        {name: 'TASK__DELETE_OTHER', scope: 'TASK'},
        {name: 'SUBTASK__CREATE', scope: 'TASK'},
        {name: 'SUBTASK__PUBLISH', scope: 'TASK'},
        {name: 'SUBTASK__LIST', scope: 'TASK'},
        {name: 'SUBTASK__LIST_ALL', scope: 'TASK'},
        {name: 'CHECKLIST__CREATE', scope: 'TASK'},
        {name: 'CHECKLIST__PUBLISH', scope: 'TASK'},
        {name: 'CHECKLIST__READ', scope: 'TASK'},
        {name: 'CHECKLIST__UPDATE', scope: 'TASK'},
        {name: 'CHECKLIST__DELETE', scope: 'TASK'},
    ];

    const initRoles = [
        {name: 'USER', scope: 'GLOBAL', permissions: ["AUTH__LOGIN", "WORKSPACE__LIST"]},
        {name: 'ADMIN', scope: 'GLOBAL', permissions: []},
        {name: 'WORKSPACE__ASSISTANT', scope: 'WORKSPACE', permissions: [
            "WORKSPACE__READ",
            "WORKSPACE__UPDATE",
            "WORKSPACE__DELETE",
            "TASK__PUBLISH",
            "TASK__LIST_ALL"
        ]},
        {name: 'WORKSPACE__MEMBER', scope: 'WORKSPACE', permissions: [
            "WORKSPACE__READ",
            "TASK__CREATE",
            "TASK__LIST",
        ]},
        {name: 'TASK__ASSISTANT', scope: 'TASK', permissions: [
            "TASK__READ",
            "TASK__UPDATE",
            "TASK__DELETE",
            "SUBTASK__PUBLISH",
            "SUBTASK__LIST_ALL",
            "CHECKLIST__PUBLISH",
            "CHECKLIST__READ",
            "CHECKLIST__UPDATE",
            "CHECKLIST__DELETE"
        ]},
        {name: 'TASK__LEADER', scope: 'TASK', permissions: [
            "TASK__READ",
            "TASK__UPDATE",
            "SUBTASK__PUBLISH",
            "SUBTASK__LIST_ALL",
            "CHECKLIST__PUBLISH",
            "CHECKLIST__READ",
            "CHECKLIST__UPDATE",
        ]},
        {name: 'TASK__MENTOR', scope: 'TASK', permissions: [
            "TASK__READ",
            "SUBTASK__CREATE",
            "SUBTASK__LIST_ALL",
            "CHECKLIST__READ",
        ]},
        {name: 'TASK__MEMBER', scope: 'TASK', permissions: [
            "TASK__READ",
            "SUBTASK__CREATE",
            "SUBTASK__LIST",
            "CHECKLIST__READ",
        ]},
    ]

    const initTaskStages = [
        {name: "To Do"},
        {name: "In Progressing"},
        {name: "Need Review"},
        {name: "Done"}
    ]

    const initUsers = [
        { name: "admin", email: "admin@domain.com", password: '$2b$10$j.6Uy.x28bTqAjwjCE9fh.EVBH6m7oNNHm2PZ5Q96yPqFlfFBDTjq' /** 123123 */, roles: [
            "ADMIN"
        ], workspaces: [
            {
                name: "admin public ws 01",
                description: "The First public workspace of admin. It has one participant is user01 as assistant role.",
                invite: [
                    {email: "user01@domain.com", role: "WORKSPACE__ASSISTANT"}
                ]
            }
        ]},
        { name: "user01", email: "user01@domain.com", password: '$2b$10$j.6Uy.x28bTqAjwjCE9fh.EVBH6m7oNNHm2PZ5Q96yPqFlfFBDTjq' /** 123123 */, roles: [
            "USER"
        ], workspaces: [
            {
                name: "user01 public ws 01",
                description: "The First public workspace of use01. It has three participants are user02 as assistant role, user03 and admin as member role.",
                invite: [
                    {email: "user02@domain.com", role: "WORKSPACE__ASSISTANT"},
                    {email: "user03@domain.com", role: "WORKSPACE__MEMBER"},
                    {email: "admin@domain.com", role: "WORKSPACE__MEMBER"}
                ]
            }
        ]},
        { name: "user02", email: "user02@domain.com", password: '$2b$10$j.6Uy.x28bTqAjwjCE9fh.EVBH6m7oNNHm2PZ5Q96yPqFlfFBDTjq' /** 123123 */, roles: [
            "USER"
        ], workspaces: []},
        { name: "user03", email: "user03@domain.com", password: '$2b$10$j.6Uy.x28bTqAjwjCE9fh.EVBH6m7oNNHm2PZ5Q96yPqFlfFBDTjq' /** 123123 */, roles: [
            "USER"
        ], workspaces: []},
        { name: "user04", email: "user04@domain.com", password: '$2b$10$j.6Uy.x28bTqAjwjCE9fh.EVBH6m7oNNHm2PZ5Q96yPqFlfFBDTjq' /** 123123 */, roles: [
            "USER"
        ], workspaces: []},
    ]

    const permissions = new Map<string, Permission>()
    
    for (const initPermission of initPermissions) {
        const pemrmission = await prisma.permission.upsert({
            where: { 
                Permission_Scope: { 
                    name: initPermission.name,
                    scope: initPermission.scope as $Enums.PermissionScope
                },
            },
            create: { 
                name: initPermission.name,
                scope: initPermission.scope as $Enums.PermissionScope
            },
            update: {}
        });
        permissions.set(initPermission.name + "__" + initPermission.scope, pemrmission)
    }

    const roles = new Map<string, Role>();
    for (const initRole of initRoles) {
        const role = await prisma.role.upsert({
            where: {
                Role_Scope: {
                    name: initRole.name,
                    scope: initRole.scope as $Enums.RoleScope
                }
            },
            create: {
                name: initRole.name,
                scope: initRole.scope as $Enums.RoleScope,
                rolePermissions: {
                    create: initRole.permissions.map(requiredPermission => {
                        return {
                            permission: {
                                connect: {
                                    id: permissions.get(requiredPermission + "__" + initRole.scope)!.id
                                } 
                            }
                        }
                    })
                }
            },
            update: {

            }
        });

        roles.set(initRole.name + "__" + initRole.scope, role)
    }

    const taskStages = new Map<string, TaskStage>();
    for (const initTaskStage of initTaskStages) {
        const taskStage = await prisma.taskStage.upsert({
            where: {
                name: initTaskStage.name
            },
            create: {
                name: initTaskStage.name
            },
            update: {
                name: initTaskStage.name
            }
        })
        taskStages.set(taskStage.name, taskStage)
    }

    const users = new Map<string, User>();
    for (const initUser of initUsers) {
        const user = await prisma.user.upsert({
            where: {
                email: initUser.email
            },
            create: {
                name: initUser.name,
                email: initUser.email,
                password: initUser.password,
                ownedWorkspaces: {
                    create: {
                        name: "private workspace of " + initUser.email,
                        type: "PRIVATE",
                        description: "The first private workspace of " + initUser.email,
                        taskStages: {
                            create:  [...taskStages].map(([key, taskStage]) => {
                                console.log(key)
                                return {
                                    taskStage: {
                                        connect: {id: taskStage.id}
                                    }
                                }
                            })
                        }
                    }
                },
                globalRoles: {
                    create: initUser.roles.map(requiredRole => {
                        return {role: { connect: { id: roles.get(requiredRole + "__GLOBAL")!.id }}}
                    })
                }
            },
            update: {

            }
        });

        users.set(user.email, user)
    }

    for (const initUser of initUsers) {
        const user = users.get(initUser.email)!
        for (const workspace of initUser.workspaces) {
            const ws = await prisma.workspace.create({
                data: {
                    name: workspace.name,
                    description: workspace.description,
                    type: "PUBLIC",
                    owner: {
                        connect: { id: user.id }
                    },
                    taskStages: {
                        create:  [...taskStages].map(([key, taskStage]) => {
                            console.log(key)
                            return {
                                taskStage: {
                                    connect: {id: taskStage.id}
                                }
                            }
                        })
                    }
                }
            })
            for (const invite of workspace.invite) {
                const invitedUser = users.get(invite.email)
                if (invitedUser) {
                    const role = roles.get(invite.role + "__WORKSPACE")!
                    const invitation = await prisma.invitation.create({
                        data: {
                            user: {
                                connect: { id: invitedUser.id }
                            },
                            role: {
                                connect: { id: role.id }
                            },
                            workspace: {
                                connect: { id: ws.id }
                            },
                            createdBy: {
                                connect: { id: user.id }
                            },
                            status: 'ACCEPTED',
                            updatedAt: new Date()
                        }
                    })
                        
                    await prisma.user.update({
                        where: { id: invitedUser.id },
                        data: {
                            workspaceRoles: {
                                create: {
                                    role: {
                                        connect: {id: roles.get(invite.role + "__WORKSPACE")!.id}
                                    },
                                    workspace: {
                                        connect: {id: ws.id}
                                    },
                                    invitation: {
                                        connect: {id: invitation.id}
                                    },
                                    joinedAt: new Date()
                                }
                            }
                        }  
                    })
                } else {
                    console.log("User not found", invite.email)
                }
            }
        }
    }
}
main()
    .then(async () => {
        console.log('After seed success')
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })