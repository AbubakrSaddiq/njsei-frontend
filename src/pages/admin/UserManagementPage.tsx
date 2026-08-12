import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, Shield, User } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/services/api";

interface UserData {
  id: number;
  name: string;
  email: string;
  affiliation?: string;
  roles: { name: string; slug: string }[];
}

const availableRoles = [
  { slug: "author", name: "Author" },
  { slug: "reviewer", name: "Reviewer" },
  { slug: "editor", name: "Editor" },
  { slug: "managing_editor", name: "Managing Editor" },
  { slug: "admin", name: "Admin" },
];

export function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [roleModal, setRoleModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });

  const users: UserData[] = data?.users ?? [];

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const assignRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      roleSlug,
    }: {
      userId: number;
      roleSlug: string;
    }) => {
      const { data } = await api.post(`/admin/users/${userId}/roles`, {
        role_slug: roleSlug,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role assigned successfully");
      setRoleModal(false);
    },
    onError: () => toast.error("Failed to assign role"),
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      roleSlug,
    }: {
      userId: number;
      roleSlug: string;
    }) => {
      const { data } = await api.delete(
        `/admin/users/${userId}/roles/${roleSlug}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role removed successfully");
    },
    onError: () => toast.error("Failed to remove role"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-serif">
            User Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage users and their roles across the platform
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length },
          {
            label: "Authors",
            value: users.filter((u) => u.roles.some((r) => r.slug === "author"))
              .length,
          },
          {
            label: "Reviewers",
            value: users.filter((u) =>
              u.roles.some((r) => r.slug === "reviewer"),
            ).length,
          },
          {
            label: "Editors",
            value: users.filter((u) =>
              u.roles.some(
                (r) => r.slug === "editor" || r.slug === "managing_editor",
              ),
            ).length,
          },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-2xl font-bold font-serif text-primary">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        />
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <Card
              key={user.id}
              className="hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col gap-4">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm">
                        {user.name}
                      </p>
                      {user.roles.map((role) => (
                        <span
                          key={role.slug}
                          className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium"
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {user.email}
                    </p>
                    {user.affiliation && (
                      <p className="text-xs text-gray-400 truncate">
                        {user.affiliation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(user);
                    setRoleModal(true);
                  }}
                >
                  <Shield size={13} />
                  Manage Roles
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Role Management Modal */}
      {roleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setRoleModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 font-serif mb-1">
              Manage Roles
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {selectedUser.name} · {selectedUser.email}
            </p>

            <div className="space-y-2">
              {availableRoles.map((role) => {
                const hasRole = selectedUser.roles.some(
                  (r) => r.slug === role.slug,
                );
                return (
                  <div
                    key={role.slug}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {role.name}
                      </span>
                    </div>
                    {hasRole ? (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          removeRoleMutation.mutate({
                            userId: selectedUser.id,
                            roleSlug: role.slug,
                          })
                        }
                        loading={removeRoleMutation.isPending}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          assignRoleMutation.mutate({
                            userId: selectedUser.id,
                            roleSlug: role.slug,
                          })
                        }
                        loading={assignRoleMutation.isPending}
                      >
                        <UserPlus size={13} />
                        Assign
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              variant="ghost"
              fullWidth
              className="mt-4"
              onClick={() => setRoleModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
