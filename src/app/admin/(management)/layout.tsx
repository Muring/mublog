import { AdminShell } from "@/components/admin/AdminSkeleton";

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
    return <AdminShell>{children}</AdminShell>;
}
