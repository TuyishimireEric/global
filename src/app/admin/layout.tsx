// app/admin/layout.tsx
import React from "react";
import AdminLayout from "../../components/AdminLayout";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

const AdminLayoutWrapper: React.FC<AdminLayoutWrapperProps> = ({
  children,
}) => {
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminLayoutWrapper;
