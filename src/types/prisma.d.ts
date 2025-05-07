import type { User as PrismaUser, Workspace } from '@/generated/prisma';
import { Prisma } from '@/generated/prisma/client';
import { loggedUserSelect } from './prisma-select';

export type User = Pick<PrismaUser, 'id' | 'email' | 'name'>;

export const loggedUserPayload = Prisma.validator<Prisma.UserDefaultArgs>()({
    select: loggedUserSelect,
})

type TLoggedUser = Prisma.UserGetPayload<typeof loggedUser>

type TWorkspace = Workspace & { 
    icon: string | LucideIcon;
    url: string;
    isActive: boolean;
    rootTasks: {id: string, title: string, url: string}[];
    workspaceId?: string;
    rootTaskId?: string;
    parentTaskId?: string;
}

type TWorkspacesMapWithKeyById = {
    [id: string]: Omit<TWorkspace, "id">
}

