type TMenuItem = {
    id: string;
    title: string;
    url: string;
    icon: string | LucideIcon;
    isActive: boolean;
    items: {
        id?: string;
        title: string;
        url: string;
    }[];
}

type TWorkspaceMenuItem = Omit<TMenuItem, "items"> & {
    items: {
        id: string; // id bắt buộc ở đây
        title: string;
        url: string;
    }[];
};