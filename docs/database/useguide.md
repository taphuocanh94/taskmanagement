# Hướng dẫn sử dụng hệ thống quản lý Workspace, Project, Task và lời mời

Hướng dẫn này mô tả cách sử dụng schema Prisma để quản lý hệ thống phân cấp với các thực thể `Workspace`, `Project`, `Task`, quy trình mời tham gia (`Invitation`), phiên đăng nhập (`UserSession`), và lịch sử mật khẩu (`PasswordChangeLog`). Schema được thiết kế cho MySQL, hỗ trợ quản lý vai trò (`Role`), quyền (`Permission`), và người dùng (`User`) với các tính năng bảo mật.

## 1. Tổng quan Schema

Schema bao gồm các model chính:

- **User**: Người dùng trong hệ thống.
  - Trường: `id`, `email` (duy nhất), `name`, `password`, `createdAt`, `updatedAt`.
  - Quan hệ: Sở hữu (`ownedWorkspaces`, `ownedProjects`, `ownedTasks`), vai trò (`globalRoles`, `workspaceRoles`, v.v.), quyền (`permissions`), lời mời (`invitations`, `createdInvitations`), phiên (`sessions`), lịch sử mật khẩu (`passwordChangeLogs`).
- **Workspace**: Không gian làm việc, có thể phân cấp.
  - Trường: `id`, `name`, `description`, `createdAt`, `updatedAt`, `ownerId`.
  - Quan hệ: Chủ sở hữu (`owner`), workspace con/cha, project (`projects`), vai trò (`userRoles`), lời mời (`invitations`).
- **Project**: Dự án, thuộc một hoặc nhiều workspace.
  - Trường: `id`, `name`, `description`, `createdAt`, `updatedAt`, `ownerId`.
  - Quan hệ: Chủ sở hữu (`owner`), project con/cha, workspace (`workspaces`), task (`tasks`), vai trò (`userRoles`), lời mời (`invitations`).
- **Task**: Nhiệm vụ, thuộc một hoặc nhiều project.
  - Trường: `id`, `title`, `description`, `createdAt`, `updatedAt`, `ownerId`.
  - Quan hệ: Chủ sở hữu (`owner`), task con/cha, project (`projects`), vai trò (`userRoles`), lời mời (`invitations`).
- **Role**: Vai trò với phạm vi (`GLOBAL`, `WORKSPACE`, `PROJECT`, `TASK`).
  - Trường: `id`, `name` (duy nhất), `description`, `scope`, `createdAt`, `updatedAt`.
  - Quan hệ: Người dùng (`globalUsers`, v.v.), quyền (`permissions`), lời mời (`invitations`).
- **Permission**: Quyền truy cập.
  - Trường: `id`, `name`, `description`, `createdAt`, `updatedAt`.
  - Quan hệ: Vai trò (`roles`), người dùng (`users`).
- **Invitation**: Lời mời gán vai trò.
  - Trường: `id`, `userId`, `roleId`, `workspaceId`/`projectId`/`taskId` (tùy chọn), `status`, `invitedAt`, `processedAt`, `createdBy`, `createdAt`, `updatedAt`.
  - Trạng thái: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELED`, `REVOKED`.
  - Quan hệ: Người dùng (`user`, `createdByUser`), vai trò (`role`), thực thể (`workspace`, `project`, `task`), vai trò được tạo (`globalRoles`, v.v.).
- **UserSession**: Phiên đăng nhập hoặc token.
  - Trường: `id`, `userId`, `sessionType` (`AUTHENTICATED`, `GUEST`, `PASSWORD_RESET`, `EMAIL_VERIFY`), `userAgent`, `ipAddress`, `revoked`, `rememberMe`, `expiresAt`, `createdAt`.
  - Quan hệ: Người dùng (`user`).
- **PasswordChangeLog**: Lịch sử thay đổi mật khẩu.
  - Trường: `id`, `userId`, `changedAt`, `ipAddress`, `userAgent`.
  - Quan hệ: Người dùng (`user`).
- **Bảng liên kết**:
  - `WorkspaceProject`: Liên kết workspace và project.
  - `ProjectTask`: Liên kết project và task.
  - `UserRole`, `UserWorkspaceRole`, `UserProjectRole`, `UserTaskRole`: Gán vai trò cho người dùng, với `assignedAt`, `joinedAt`, `invitationId`.
  - `RolePermission`, `UserPermission`: Gán quyền, với `assignedAt`.

### Schema đầy đủ

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum RoleScope {
  GLOBAL
  WORKSPACE
  PROJECT
  TASK
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELED
  REVOKED
}

enum SessionType {
  AUTHENTICATED
  GUEST
  PASSWORD_RESET
  EMAIL_VERIFY
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  ownedWorkspaces Workspace[] @relation("WorkspaceOwner")
  ownedProjects   Project[]   @relation("ProjectOwner")
  ownedTasks      Task[]      @relation("TaskOwner")
  globalRoles     UserRole[]
  workspaceRoles  UserWorkspaceRole[]
  projectRoles    UserProjectRole[]
  taskRoles       UserTaskRole[]
  permissions     UserPermission[]
  sessions        UserSession[]
  passwordChangeLogs PasswordChangeLog[]
  invitations        Invitation[]        @relation("UserInvitations")
  createdInvitations Invitation[]        @relation("CreatedInvitations")

  @@index([email])
}

model Workspace {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  ownerId     String
  owner       User     @relation("WorkspaceOwner", fields: [ownerId], references: [id])
  parentId    String?  @map("parent_id")
  parent      Workspace? @relation("WorkspaceHierarchy", fields: [parentId], references: [id])
  children    Workspace[] @relation("WorkspaceHierarchy")
  projects    WorkspaceProject[]
  userRoles   UserWorkspaceRole[]
  invitations Invitation[]  @relation("WorkspaceInvitations")

  @@index([ownerId])
  @@index([name])
}

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  ownerId     String
  owner       User     @relation("ProjectOwner", fields: [ownerId], references: [id])
  parentId    String?  @map("parent_id")
  parent      Project? @relation("ProjectHierarchy", fields: [parentId], references: [id])
  children    Project[] @relation("ProjectHierarchy")
  workspaces  WorkspaceProject[]
  tasks       ProjectTask[]
  userRoles   UserProjectRole[]
  invitations Invitation[]  @relation("ProjectInvitations")

  @@index([ownerId])
  @@index([name])
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  ownerId     String
  owner       User     @relation("TaskOwner", fields: [ownerId], references: [id])
  parentId    String?  @map("parent_id")
  parent      Task?    @relation("TaskHierarchy", fields: [parentId], references: [id])
  children    Task[]   @relation("TaskHierarchy")
  projects    ProjectTask[]
  userRoles   UserTaskRole[]
  invitations Invitation[]  @relation("TaskInvitations")

  @@index([ownerId])
  @@index([title])
}

model Role {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  scope       RoleScope
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  globalUsers UserRole[]
  workspaceUsers UserWorkspaceRole[]
  projectUsers UserProjectRole[]
  taskUsers   UserTaskRole[]
  permissions RolePermission[]
  invitations Invitation[]

  @@index([scope])
  @@index([name])
}

model Permission {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  roles       RolePermission[]
  users       UserPermission[]

  @@index([name])
}

model Invitation {
  id          String            @id @default(uuid())
  userId      String            @map("user_id")
  roleId      String            @map("role_id")
  workspaceId String?           @map("workspace_id")
  projectId   String?           @map("project_id")
  taskId      String?           @map("task_id")
  status      InvitationStatus  @default(PENDING)
  invitedAt   DateTime          @default(now())
  processedAt DateTime?
  createdBy   String            @map("created_by")
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  user        User              @relation("UserInvitations", fields: [userId], references: [id])
  role        Role              @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  workspace   Workspace?        @relation("WorkspaceInvitations", fields: [workspaceId], references: [id])
  project     Project?          @relation("ProjectInvitations", fields: [projectId], references: [id])
  task        Task?             @relation("TaskInvitations", fields: [taskId], references: [id])
  createdByUser User            @relation("CreatedInvitations", fields: [createdBy], references: [id])
  globalRoles   UserRole[]        @relation("InvitationGlobalRoles")
  workspaceRoles UserWorkspaceRole[] @relation("InvitationWorkspaceRoles")
  projectRoles  UserProjectRole[]  @relation("InvitationProjectRoles")
  taskRoles     UserTaskRole[]     @relation("InvitationTaskRoles")

  @@index([userId])
  @@index([roleId])
  @@index([workspaceId])
  @@index([projectId])
  @@index([taskId])
}

model WorkspaceProject {
  workspaceId String   @map("workspace_id")
  projectId   String   @map("project_id")
  createdAt   DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  project     Project   @relation(fields: [projectId], references: [id])

  @@id([workspaceId, projectId])
  @@index([projectId])
}

model ProjectTask {
  projectId String   @map("project_id")
  taskId    String   @map("task_id")
  createdAt DateTime @default(now())
  project   Project  @relation(fields: [projectId], references: [id])
  task      Task     @relation(fields: [taskId], references: [id])

  @@id([projectId, taskId])
  @@index([taskId])
}

model UserRole {
  userId      String   @map("user_id")
  roleId      String   @map("role_id")
  assignedAt  DateTime @default(now())
  joinedAt    DateTime?
  invitationId String?  @map("invitation_id")
  user        User     @relation(fields: [userId], references: [id])
  role        Role     @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  invitation  Invitation? @relation("InvitationGlobalRoles", fields: [invitationId], references: [id])

  @@id([userId, roleId])
  @@index([roleId])
}

model UserWorkspaceRole {
  userId      String   @map("user_id")
  workspaceId String   @map("workspace_id")
  roleId      String   @map("role_id")
  assignedAt  DateTime @default(now())
  joinedAt    DateTime?
  invitationId String?  @map("invitation_id")
  user        User     @relation(fields: [userId], references: [id])
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  role        Role     @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  invitation  Invitation? @relation("InvitationWorkspaceRoles", fields: [invitationId], references: [id])

  @@id([userId, workspaceId, roleId])
  @@index([workspaceId])
  @@index([roleId])
}

model UserProjectRole {
  userId      String   @map("user_id")
  projectId   String   @map("project_id")
  roleId      String   @map("role_id")
  assignedAt  DateTime @default(now())
  joinedAt    DateTime?
  invitationId String?  @map("invitation_id")
  user        User     @relation(fields: [userId], references: [id])
  project     Project  @relation(fields: [projectId], references: [id])
  role        Role     @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  invitation  Invitation? @relation("InvitationProjectRoles", fields: [invitationId], references: [id])

  @@id([userId, projectId, roleId])
  @@index([projectId])
  @@index([roleId])
}

model UserTaskRole {
  userId      String   @map("user_id")
  taskId      String   @map("task_id")
  roleId      String   @map("role_id")
  assignedAt  DateTime @default(now())
  joinedAt    DateTime?
  invitationId String?  @map("invitation_id")
  user        User     @relation(fields: [userId], references: [id])
  task        Task     @relation(fields: [taskId], references: [id])
  role        Role     @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  invitation  Invitation? @relation("InvitationTaskRoles", fields: [invitationId], references: [id])

  @@id([userId, taskId, roleId])
  @@index([taskId])
  @@index([roleId])
}

model RolePermission {
  roleId       String   @map("role_id")
  permissionId String   @map("permission_id")
  assignedAt   DateTime @default(now())
  role         Role     @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])

  @@id([roleId, permissionId])
  @@index([permissionId])
}

model UserPermission {
  userId       String   @map("user_id")
  permissionId String   @map("permission_id")
  assignedAt   DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])

  @@id([userId, permissionId])
  @@index([permissionId])
}

model UserSession {
  id          String      @id @default(uuid())
  user        User?       @relation(fields: [userId], references: [id])
  userId      String?
  sessionType SessionType @default(GUEST)
  userAgent   String?
  ipAddress   String?
  revoked     Boolean     @default(false)
  rememberMe  Boolean     @default(false)
  expiresAt   DateTime
  createdAt   DateTime    @default(now())

  @@index([userId])
  @@index([sessionType])
  @@index([revoked])
}

model PasswordChangeLog {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  changedAt DateTime @default(now())
  ipAddress String?
  userAgent String?

  @@index([userId])
  @@index([changedAt])
}
```

## 2. Cài đặt và triển khai

### Yêu cầu

- Node.js (v16+)
- MySQL (v8.0+)
- Prisma CLI (`npm install -g prisma`)

### Cài đặt

1. **Khởi tạo dự án**:

   ```bash
   mkdir task-management
   cd task-management
   npm init -y
   npm install @prisma/client bcrypt
   ```

   - `bcrypt` để mã hóa mật khẩu.

2. **Cấu hình Prisma**:

   - Tạo thư mục `prisma` và file `prisma/schema.prisma`, dán schema trên.

   - Cấu hình kết nối MySQL trong `.env`:

     ```
     DATABASE_URL="mysql://user:password@localhost:3306/task_management"
     ```

3. **Tạo database**:

   ```bash
   npx prisma migrate dev --name init
   ```

4. **Tạo client**:

   ```bash
   npx prisma generate
   ```

### Chạy ứng dụng

- Tạo file `index.js` (xem mã ví dụ ở mục 7).

- Chạy:

  ```bash
  node index.js
  ```

## 3. Quy trình quản lý lời mời

### Tổng quan

- **Mục đích**: Gán vai trò (`Role`) cho người dùng (`User`) trong `Workspace`, `Project`, `Task`, hoặc toàn cục (`GLOBAL`).
- **Trạng thái**:
  - `PENDING`: Lời mời được tạo, chờ xử lý.
  - `ACCEPTED`: Người dùng chấp nhận, vai trò được gán.
  - `REJECTED`: Người dùng từ chối, không gán vai trò.
  - `CANCELED`: Quản lý hủy lời mời khi còn `PENDING`.
  - `REVOKED`: Quản lý thu hồi vai trò sau khi `ACCEPTED`, xóa vai trò.
- **Thời gian**:
  - `invitedAt`: Thời gian tạo lời mời (gán vai trò).
  - `processedAt`: Thời gian xử lý (`ACCEPTED`, `REJECTED`, `CANCELED`, `REVOKED`).
  - `assignedAt`: Thời gian gán vai trò trong bảng vai trò (khi tạo lời mời).
  - `joinedAt`: Thời gian tham gia (khi `ACCEPTED`).

### Trường hợp sử dụng

#### 3.1. Tạo lời mời

- **Mô tả**: Quản lý tạo lời mời để gán vai trò.
- **Điều kiện**: Người dùng, vai trò, và thực thể (nếu có) phải tồn tại. Vai trò phải có `scope` phù hợp.
- **Kết quả**: Bản ghi `Invitation` với `status: PENDING`, `invitedAt` ghi nhận thời gian.

#### 3.2. Chấp nhận lời mời

- **Mô tả**: Người dùng chấp nhận lời mời, vai trò được gán.
- **Điều kiện**: Lời mời phải ở `PENDING`, không bị `CANCELED`.
- **Kết quả**:
  - `Invitation` cập nhật `status: ACCEPTED`, `processedAt` ghi nhận thời gian.
  - Bản ghi vai trò được tạo với `invitationId`, `joinedAt` ghi nhận thời gian.

#### 3.3. Từ chối lời mời

- **Mô tả**: Người dùng từ chối lời mời.
- **Điều kiện**: Lời mời phải ở `PENDING`, không bị `CANCELED`.
- **Kết quả**: `Invitation` cập nhật `status: REJECTED`, `processedAt` ghi nhận thời gian.

#### 3.4. Hủy lời mời

- **Mô tả**: Quản lý hủy lời mời khi còn `PENDING`.
- **Điều kiện**: Lời mời ở `PENDING`.
- **Kết quả**: `Invitation` cập nhật `status: CANCELED`, `processedAt` ghi nhận thời gian.

#### 3.5. Thu hồi vai trò

- **Mô tả**: Quản lý thu hồi vai trò sau khi chấp nhận.
- **Điều kiện**: Lời mời ở `ACCEPTED`.
- **Kết quả**:
  - `Invitation` cập nhật `status: REVOKED`, `processedAt` ghi nhận thời gian.
  - Bản ghi vai trò bị xóa.

#### 3.6. Truy cập lời mời đã hủy

- **Mô tả**: Người dùng cố chấp nhận/từ chối lời mời đã bị hủy.
- **Điều kiện**: Lời mời ở `CANCELED`.
- **Kết quả**: Trả về lỗi: "Lời mời này đã bị hủy".

## 4. Quản lý Workspace

### 4.1. Tạo Workspace

- **Mô tả**: Tạo không gian làm việc mới với chủ sở hữu.
- **Kết quả**: Bản ghi `Workspace` được tạo, liên kết với `owner`.

### 4.2. Cập nhật Workspace

- **Mô tả**: Sửa tên, mô tả, hoặc workspace cha.
- **Kết quả**: Bản ghi `Workspace` được cập nhật, `updatedAt` ghi nhận thời gian.

### 4.3. Xóa Workspace

- **Mô tả**: Xóa workspace, bao gồm liên kết.
- **Điều kiện**: Không có workspace con hoặc cần xóa đệ quy.
- **Kết quả**: Bản ghi `Workspace` và liên kết bị xóa.

### 4.4. Gán vai trò cho Workspace

- **Mô tả**: Gán vai trò (`WORKSPACE` scope) qua lời mời.
- **Kết quả**: Lời mời được tạo, vai trò được gán khi chấp nhận.

## 5. Quản lý Project

### 5.1. Tạo Project

- **Mô tả**: Tạo dự án với chủ sở hữu, liên kết với workspace.
- **Kết quả**: Bản ghi `Project` và `WorkspaceProject` được tạo.

### 5.2. Cập nhật Project

- **Mô tả**: Sửa tên, mô tả, hoặc project cha.
- **Kết quả**: Bản ghi `Project` được cập nhật.

### 5.3. Xóa Project

- **Mô tả**: Xóa project, bao gồm liên kết.
- **Kết quả**: Bản ghi `Project` và liên kết bị xóa.

### 5.4. Gán vai trò cho Project

- **Mô tả**: Gán vai trò (`PROJECT` scope) qua lời mời.
- **Kết quả**: Lời mời được tạo, vai trò được gán khi chấp nhận.

## 6. Quản lý Task

### 6.1. Tạo Task

- **Mô tả**: Tạo nhiệm vụ với chủ sở hữu, liên kết với project.
- **Kết quả**: Bản ghi `Task` và `ProjectTask` được tạo.

### 6.2. Cập nhật Task

- **Mô tả**: Sửa tiêu đề, mô tả, hoặc task cha.
- **Kết quả**: Bản ghi `Task` được cập nhật.

### 6.3. Xóa Task

- **Mô tả**: Xóa task, bao gồm liên kết.
- **Kết quả**: Bản ghi `Task` và liên kết bị xóa.

### 6.4. Gán vai trò cho Task

- **Mô tả**: Gán vai trò (`TASK` scope) qua lời mời.
- **Kết quả**: Lời mời được tạo, vai trò được gán khi chấp nhận.

## 7. Quản lý User và bảo mật

### 7.1. Tạo User

- **Mô tả**: Tạo người dùng với mật khẩu mã hóa.
- **Kết quả**: Bản ghi `User` được tạo, mật khẩu được mã hóa.

### 7.2. Đăng nhập và tạo phiên

- **Mô tả**: Xác thực người dùng, tạo phiên `AUTHENTICATED`.
- **Kết quả**: Bản ghi `UserSession` được tạo.

### 7.3. Thu hồi phiên

- **Mô tả**: Hủy phiên đăng nhập.
- **Điều kiện**: Phiên tồn tại, chưa bị thu hồi.
- **Kết quả**: `UserSession` cập nhật `revoked: true`.

### 7.4. Thay đổi mật khẩu

- **Mô tả**: Cập nhật mật khẩu, ghi lịch sử.
- **Kết quả**: `User` cập nhật `password`, bản ghi `PasswordChangeLog` được tạo.

## 8. Quản lý vai trò và quyền

### 8.1. Tạo Role

- **Mô tả**: Tạo vai trò với tên duy nhất.
- **Kết quả**: Bản ghi `Role` được tạo.

### 8.2. Gán Role

- **Mô tả**: Gán vai trò qua lời mời hoặc trực tiếp.
- **Kết quả**: Lời mời hoặc bản ghi vai trò được tạo.

### 8.3. Tạo Permission

- **Mô tả**: Tạo quyền truy cập.
- **Kết quả**: Bản ghi `Permission` được tạo.

### 8.4. Gán Permission

- **Mô tả**: Gán quyền cho vai trò hoặc người dùng.
- **Kết quả**: Bản ghi `RolePermission` hoặc `UserPermission` được tạo.

## 9. Mã ví dụ

Dưới đây là mã ví dụ minh họa tất cả các trường hợp sử dụng, sử dụng `bcrypt` để mã hóa mật khẩu.

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// Middleware kiểm tra role.scope
prisma.$use(async (params, next) => {
  const checkScope = async (model, expectedScope) => {
    if (params.model === model && params.action === 'create') {
      const role = await prisma.role.findUnique({ where: { id: params.args.data.roleId } });
      if (role.scope !== expectedScope) {
        throw new Error(`Role must have scope ${expectedScope} for ${model}`);
      }
    }
  };
  await checkScope('UserRole', 'GLOBAL');
  await checkScope('UserWorkspaceRole', 'WORKSPACE');
  await checkScope('UserProjectRole', 'PROJECT');
  await checkScope('UserTaskRole', 'TASK');
  return next(params);
});

// Giả lập gửi thông báo
async function sendNotification(userId, message) {
  console.log(`Gửi thông báo đến user ${userId}: ${message}`);
}

// Kiểm tra trạng thái lời mời
async function validateInvitation(invitationId, action) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });
  if (!invitation) {
    throw new Error('Lời mời không tồn tại');
  }
  if (invitation.status === 'CANCELED') {
    throw new Error('Lời mời này đã bị hủy');
  }
  if (action === 'accept' || action === 'reject') {
    if (invitation.status !== 'PENDING') {
      throw new Error(`Lời mời đã ở trạng thái ${invitation.status}, không thể ${action}`);
    }
  }
  if (action === 'revoke' && invitation.status !== 'ACCEPTED') {
    throw new Error('Chỉ có thể thu hồi lời mời đã được chấp nhận');
  }
  return invitation;
}

async function main() {
  // 1. Quản lý User
  // Tạo user với mật khẩu mã hóa
  const password = await bcrypt.hash('password123', 10);
  await prisma.user.createMany({
    data: [
      { id: 'user1', email: 'alice@example.com', name: 'Alice', password },
      { id: 'user2', email: 'bob@example.com', name: 'Bob', password },
      { id: 'user3', email: 'charlie@example.com', name: 'Charlie', password },
    ],
    skipDuplicates: true,
  });
  console.log('Tạo user1, user2, user3');

  // Tạo phiên đăng nhập
  await prisma.userSession.create({
    data: {
      id: 'session1',
      userId: 'user1',
      sessionType: 'AUTHENTICATED',
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.1.1',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
      rememberMe: true,
    },
  });
  console.log('Tạo phiên đăng nhập cho user1');

  // Thay đổi mật khẩu
  const newPassword = await bcrypt.hash('newpassword123', 10);
  await prisma.user.update({
    where: { id: 'user1' },
    data: {
      password: newPassword,
      passwordChangeLogs: {
        create: {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      },
    },
  });
  console.log('Thay đổi mật khẩu cho user1');

  // Thu hồi phiên
  await prisma.userSession.update({
    where: { id: 'session1' },
    data: { revoked: true },
  });
  console.log('Thu hồi phiên session1');

  // 2. Tạo Role và Permission
  await prisma.role.createMany({
    data: [
      { id: 'role-global-admin', name: 'Super Admin', scope: 'GLOBAL' },
      { id: 'role-ws-admin', name: 'Admin', scope: 'WORKSPACE' },
      { id: 'role-ws-member', name: 'Member', scope: 'WORKSPACE' },
      { id: 'role-prj-manager', name: 'Manager', scope: 'PROJECT' },
      { id: 'role-task-assignee', name: 'Assignee', scope: 'TASK' },
    ],
    skipDuplicates: true,
  });
  console.log('Tạo các vai trò');

  await prisma.permission.createMany({
    data: [
      { id: 'perm-create', name: 'Create Content' },
      { id: 'perm-edit', name: 'Edit Content' },
    ],
    skipDuplicates: true,
  });
  console.log('Tạo các quyền');

  // 3. Quản lý Workspace
  await prisma.workspace.create({
    data: {
      id: 'ws1',
      name: 'Main Workspace',
      description: 'Workspace chính',
      ownerId: 'user1',
      children: {
        create: [{ id: 'ws2', name: 'Sub Workspace', ownerId: 'user1' }],
      },
    },
  });
  console.log('Tạo workspace ws1 và ws2');

  await prisma.workspace.update({
    where: { id: 'ws1' },
    data: { description: 'Workspace chính được cập nhật' },
  });
  console.log('Cập nhật workspace ws1');

  // 4. Quản lý Project
  await prisma.project.create({
    data: {
      id: 'prj1',
      name: 'Website Redesign',
      description: 'Dự án thiết kế lại website',
      ownerId: 'user1',
      workspaces: {
        create: [
          { workspaceId: 'ws1' },
          { workspaceId: 'ws2' },
        ],
      },
    },
  });
  console.log('Tạo project prj1, liên kết với ws1 và ws2');

  await prisma.project.update({
    where: { id: 'prj1' },
    data: { name: 'Updated Website Redesign' },
  });
  console.log('Cập nhật project prj1');

  // 5. Quản lý Task
  await prisma.task.create({
    data: {
      id: 'task1',
      title: 'Design Homepage',
      description: 'Thiết kế trang chủ',
      ownerId: 'user1',
      projects: {
        create: [{ projectId: 'prj1' }],
      },
      children: {
        create: [{ id: 'task2', title: 'Design Header', ownerId: 'user1' }],
      },
    },
  });
  console.log('Tạo task task1 và task2, liên kết với prj1');

  await prisma.task.update({
    where: { id: 'task1' },
    data: { title: 'Updated Design Homepage' },
  });
  console.log('Cập nhật task task1');

  // 6. Quản lý lời mời
  await prisma.invitation.create({
    data: {
      id: 'inv1',
      userId: 'user2',
      roleId: 'role-ws-member',
      workspaceId: 'ws1',
      createdBy: 'user1',
    },
  });
  await sendNotification('user2', 'Bạn được mời làm Member của Workspace ws1');
  console.log('Tạo lời mời inv1');

  await prisma.invitation.create({
    data: {
      id: 'inv2',
      userId: 'user2',
      roleId: 'role-prj-manager',
      projectId: 'prj1',
      createdBy: 'user1',
    },
  });
  await sendNotification('user2', 'Bạn được mời làm Manager của Project prj1');
  console.log('Tạo lời mời inv2');

  await prisma.invitation.create({
    data: {
      id: 'inv3',
      userId: 'user3',
      roleId: 'role-task-assignee',
      taskId: 'task1',
      createdBy: 'user1',
    },
  });
  await sendNotification('user3', 'Bạn được mời làm Assignee của Task task1');
  console.log('Tạo lời mời inv3');

  await prisma.invitation.create({
    data: {
      id: 'inv4',
      userId: 'user2',
      roleId: 'role-global-admin',
      createdBy: 'user1',
    },
  });
  await sendNotification('user2', 'Bạn được mời làm Super Admin');
  console.log('Tạo lời mời inv4');

  // Hủy lời mời
  let invitation = await validateInvitation('inv2', 'cancel');
  invitation = await prisma.invitation.update({
    where: { id: 'inv2' },
    data: { status: 'CANCELED', processedAt: new Date() },
  });
  await sendNotification('user2', 'Lời mời làm Manager của Project prj1 đã bị hủy');
  console.log(`Hủy lời mời inv2 lúc: ${invitation.processedAt}`);

  // Thử chấp nhận lời mời đã hủy
  try {
    await validateInvitation('inv2', 'accept');
    await prisma.invitation.update({
      where: { id: 'inv2' },
      data: { status: 'ACCEPTED' },
    });
  } catch (error) {
    console.log(`Lỗi khi chấp nhận inv2: ${error.message}`);
  }

  // Chấp nhận lời mời
  invitation = await validateInvitation('inv1', 'accept');
  invitation = await prisma.invitation.update({
    where: { id: 'inv1' },
    data: { status: 'ACCEPTED', processedAt: new Date() },
  });
  if (invitation.status === 'ACCEPTED') {
    await prisma.userWorkspaceRole.create({
      data: {
        userId: invitation.userId,
        workspaceId: invitation.workspaceId,
        roleId: invitation.roleId,
        invitationId: invitation.id,
        joinedAt: new Date(),
      },
    });
    console.log(`User2 đã tham gia Workspace ws1 với vai trò Member qua lời mời inv1. Gán lúc: ${invitation.invitedAt}, Tham gia lúc: ${invitation.processedAt}`);
  }

  // Từ chối lời mời
  invitation = await validateInvitation('inv3', 'reject');
  invitation = await prisma.invitation.update({
    where: { id: 'inv3' },
    data: { status: 'REJECTED', processedAt: new Date() },
  });
  console.log(`User3 đã từ chối lời mời inv3 lúc: ${invitation.processedAt}`);

  // Thu hồi vai trò
  invitation = await validateInvitation('inv1', 'revoke');
  if (invitation.status === 'ACCEPTED') {
    await prisma.invitation.update({
      where: { id: 'inv1' },
      data: { status: 'REVOKED', processedAt: new Date() },
    });
    await prisma.userWorkspaceRole.deleteMany({
      where: { invitationId: 'inv1' },
    });
    await sendNotification('user2', 'Vai trò Member của bạn trong Workspace ws1 đã bị thu hồi');
    console.log(`Thu hồi vai trò inv1 lúc: ${invitation.processedAt}`);
  }

  // Chấp nhận lời mời toàn cục
  invitation = await validateInvitation('inv4', 'accept');
  invitation = await prisma.invitation.update({
    where: { id: 'inv4' },
    data: { status: 'ACCEPTED', processedAt: new Date() },
  });
  if (invitation.status === 'ACCEPTED') {
    await prisma.userRole.create({
      data: {
        userId: invitation.userId,
        roleId: invitation.roleId,
        invitationId: invitation.id,
        joinedAt: new Date(),
      },
    });
    console.log(`User2 đã trở thành Super Admin qua lời mời inv4. Gán lúc: ${invitation.invitedAt}, Tham gia lúc: ${invitation.processedAt}`);
  }

  // 7. Quản lý quyền
  await prisma.rolePermission.create({
    data: {
      roleId: 'role-ws-member',
      permissionId: 'perm-edit',
    },
  });
  console.log('Gán quyền Edit Content cho vai trò Member');

  await prisma.userPermission.create({
    data: {
      userId: 'user2',
      permissionId: 'perm-create',
    },
  });
  console.log('Gán quyền Create Content cho User2');

  // 8. Truy vấn
  const workspaces = await prisma.workspace.findMany({
    include: {
      owner: true,
      userRoles: { include: { user: true, role: true } },
      invitations: { include: { user: true, role: true } },
    },
  });
  console.log('Danh sách Workspace:', workspaces);

  const projects = await prisma.project.findMany({
    include: {
      owner: true,
      workspaces: { include: { workspace: true } },
      userRoles: { include: { user: true, role: true } },
    },
  });
  console.log('Danh sách Project:', projects);

  const tasks = await prisma.task.findMany({
    include: {
      owner: true,
      projects: { include: { project: true } },
      userRoles: { include: { user: true, role: true } },
    },
  });
  console.log('Danh sách Task:', tasks);

  const userInvitations = await prisma.invitation.findMany({
    where: { userId: 'user2' },
    include: { role: true, workspace: true, project: true, task: true },
  });
  console.log('Lời mời của User2:', userInvitations);

  const userRoles = await prisma.user.findUnique({
    where: { id: 'user2' },
    include: {
      globalRoles: { include: { role: true, invitation: true } },
      workspaceRoles: { include: { role: true, workspace: true, invitation: true } },
      projectRoles: { include: { role: true, project: true, invitation: true } },
      taskRoles: { include: { role: true, task: true, invitation: true } },
    },
  });
  console.log('Vai trò của User2:', userRoles);

  const sessions = await prisma.userSession.findMany({
    where: { userId: 'user1' },
  });
  console.log('Phiên của User1:', sessions);

  const passwordLogs = await prisma.passwordChangeLog.findMany({
    where: { userId: 'user1' },
  });
  console.log('Lịch sử mật khẩu của User1:', passwordLogs);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## 10. Lưu ý và đề xuất

### Lưu ý

- **Bảo mật mật khẩu**:
  - Mật khẩu được mã hóa bằng `bcrypt`. Không lưu mật khẩu thô.
- **Quản lý phiên**:
  - Kiểm tra `revoked` và `expiresAt` trước khi chấp nhận phiên.
  - `sessionType` hỗ trợ nhiều kịch bản (đăng nhập, reset mật khẩu, xác thực email).
- **Chuyển trạng thái lời mời**:
  - Chỉ cho phép:
    - `PENDING` → `ACCEPTED`, `REJECTED`, `CANCELED`.
    - `ACCEPTED` → `REVOKED`.
  - `processedAt` ghi nhận thời gian xử lý, nhưng `updatedAt` có thể thay đổi do chỉnh sửa khác.
- **Xóa đệ quy**:
  - Xóa `Workspace`, `Project`, `Task` cần xử lý con/cha và liên kết.

### Đề xuất

- **Thêm trường**:
  - `expiresAt` trong `Invitation` để đặt thời hạn.
  - `reason` trong `Invitation` cho lý do hủy/thu hồi.
- **Tích hợp thông báo**:
  - Dùng `nodemailer` cho email thông báo.
- **Phân quyền**:
  - Thêm middleware kiểm tra quyền của `createdBy` trước khi tạo/hủy/thu hồi lời mời.
- **Audit log**:
  - Tạo bảng `AuditLog` để ghi lịch sử thay đổi.

## 11. Kết luận

Schema cung cấp hệ thống quản lý toàn diện với bảo mật (mật khẩu, phiên), sở hữu (`owner`), và quy trình lời mời linh hoạt. Các trạng thái `CANCELED` và `REVOKED` hỗ trợ quản lý vai trò hiệu quả. Hệ thống phù hợp cho ứng dụng quản lý task phân cấp.

Nếu cần thêm tính năng (email, audit log, v.v.), hãy yêu cầu cụ thể!