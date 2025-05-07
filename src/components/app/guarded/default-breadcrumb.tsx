import {
    Breadcrumb,
    BreadcrumbItem,
    // BreadcrumbLink,
    BreadcrumbList,
    // BreadcrumbPage,
    // BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
export default function DefaultBreadcrumb() {
    return (
        <div className="hidden md:block">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        {/* <BreadcrumbLink href="/dashboard"> */}
                            Dashboard
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