import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingSidebar() {
    return <><SidebarGroup>
    <SidebarGroupLabel className="px-1"><Skeleton className="h-3 w-[150px] bg-gray-300 rounded" /></SidebarGroupLabel>
    <SidebarMenu>
        {Array.from(Array(3).keys()).map(i => {
          return <div key={i} className="flex flex-row items-center gap-3 p-1">
            <Skeleton className="h-4 w-6 bg-gray-300 rounded" />
            <Skeleton className="h-4 w-[200px] bg-gray-300" />
          </div>
        })}
    </SidebarMenu>
  </SidebarGroup>
  <SidebarGroup>
    <SidebarGroupLabel className="px-1"><Skeleton className="h-3 w-[150px] bg-gray-300 rounded" /></SidebarGroupLabel>
    <SidebarMenu>
        {Array.from(Array(3).keys()).map(i => {
          return <div key={i} className="flex flex-row items-center gap-3 p-1">
            <Skeleton className="h-4 w-6 bg-gray-300 rounded" />
            <Skeleton className="h-4 w-[200px] bg-gray-300" />
          </div>
        })}
    </SidebarMenu>
  </SidebarGroup>
  </>
}