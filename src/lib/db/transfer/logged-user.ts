import { Prisma, Workspace } from '@/generated/prisma/client';
import { TLoggedUser } from '@/types/prisma';

type RoleWithPermissions = Prisma.RoleGetPayload<{
    select: {
        id: true;
        name: true;
        rolePermissions: {
            select: {
                permission: {
                    select: {
                        id: true;
                        name: true;
                    };
                }
            };
        };
    };
}>;

// type WorkspaceRoleWithPermissions = Prisma.RoleGetPayload<{
//     select: {
//         workspace: true
//         name: true;
//         permissions: {
//             select: {
//                 permission: {
//                     select: {
//                         name: true;
//                     };
//                 }
//             };
//         };
//     };
// }>;

type TPermission = {
    id: string;
    name: string
}
type TRole = {
    id: string;
    name: string;
    permissions: TPermission[]
}
type TWorkspace = {
    id: string;
    name: string;
    description: string | null;
    parentId: string | null;
    type: "PUBLIC" | "PRIVATE";
    isOwned: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type TWorkspaceWithRoles = TWorkspace & {
    roles: TRole[];
};

export type TLoggedUserPayload = {
    id: string;
    email: string;
    name: string;
    globalRoles: TRole[];
    workspaces: TWorkspaceWithRoles[]
}

export class CLoggedUser {
    id: string;
    email: string;
    name: string;
    globalRoles: TRole[];
    workspaces: TWorkspaceWithRoles[]

    constructor(data: TLoggedUser) {
        console.log(data)
        this.id = data.id;
        this.email = data.email;
        this.name = data.name;
        this.globalRoles = data.globalRoles.map(({role}: {role: RoleWithPermissions}) => {
            return {
                id: role.id,
                name: role.name,
                permissions: role.rolePermissions.map(({ permission }: { permission: RoleWithPermissions["rolePermissions"][0]["permission"] }) => ({
                    id: permission.id,
                    name: permission.name
                }))
            }
        });

        this.workspaces = [...data.ownedWorkspaces.map((workspace: TWorkspace): TWorkspaceWithRoles => {
            return {
                id: workspace.id,
                name: workspace.name,
                description: workspace.description,
                parentId: workspace.parentId || null,
                type: workspace.type,
                isOwned: true,
                roles: [],
                createdAt: workspace.createdAt,
                updatedAt: workspace.updatedAt,
            }
        }),
        ...this.transferWorkspaceRolesToWorkspaceWithRole(data.workspaceRoles)]
    }

    transferWorkspaceRolesToWorkspaceWithRole(workspaceRoles: TLoggedUser["workspaceRoles"]) {
        const map = new Map<string, TWorkspaceWithRoles>();

        workspaceRoles.forEach(({ workspace, role }: { workspace: Workspace, role: RoleWithPermissions }) => {
            if (!map.has(workspace.id)) {
                map.set(workspace.id, { ...workspace, isOwned: false, roles: [] });
            }
            map.get(workspace.id)!.roles.push({
                id: role.id,
                name: role.name,
                permissions: role.rolePermissions.map(({ permission }: { permission: RoleWithPermissions["rolePermissions"][0]["permission"] }) => ({
                    id: permission.id,
                    name: permission.name
                }))
            });
        });

        const result = Array.from(map.values());
        return result;
    }

    toJSON(): TLoggedUserPayload {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            globalRoles: this.globalRoles,
            workspaces: this.workspaces
        }
    }
}