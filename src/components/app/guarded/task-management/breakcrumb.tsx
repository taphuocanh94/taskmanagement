import {
    Breadcrumb,
    BreadcrumbItem,
    // BreadcrumbLink,
    BreadcrumbList,
    // BreadcrumbPage,
    // BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
export default function TaskManagementBreadcrumb() {
    return (
        <div className="hidden md:block">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        {/* <BreadcrumbLink href="/dashboard"> */}
                            Task Management
                        {/* </BreadcrumbLink> */}
                    </BreadcrumbItem>
                    {/* <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Task Management</BreadcrumbPage>
                    </BreadcrumbItem> */}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}