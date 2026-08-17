import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Building, Lock, Shield, Save } from "lucide-react";
import toast from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/store/auth.store";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  affiliation: z.string().optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "roles">(
    "profile",
  );

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: profileService.getProfile,
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: data?.user?.name ?? "",
      email: data?.user?.email ?? "",
      affiliation: data?.user?.affiliation ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Update auth store
      if (user) {
        setAuth(
          { ...user, ...response.user },
          localStorage.getItem("njsei_token")!,
        );
      }
      toast.success("Profile updated successfully");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: profileService.updatePassword,
    onSuccess: () => {
      passwordForm.reset();
      toast.success("Password updated successfully");
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { errors?: { current_password?: string[] } } };
      };
      const msg = err.response?.data?.errors?.current_password?.[0];
      toast.error(msg ?? "Failed to update password");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const profile = data?.user;

  const tabs = [
    { key: "profile", label: "Profile Info", icon: <User size={15} /> },
    { key: "password", label: "Password", icon: <Lock size={15} /> },
    { key: "roles", label: "My Roles", icon: <Shield size={15} /> },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-serif">
          My Profile
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      {/* Avatar Card */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#2A438C] flex items-center justify-center text-white font-bold text-2xl font-serif flex-shrink-0">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg font-serif">
              {profile?.name}
            </h3>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            {profile?.affiliation && (
              <p className="text-xs text-gray-400 mt-0.5">
                {profile?.affiliation}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Member since{" "}
              {new Date(profile?.created_at ?? "").toLocaleDateString("en-NG", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
              ${
                activeTab === tab.key
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Info Tab */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <form
            onSubmit={profileForm.handleSubmit((data) =>
              updateProfileMutation.mutate(data),
            )}
            className="space-y-4"
          >
            <Input
              label="Full Name"
              required
              leftIcon={<User size={15} />}
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register("name")}
            />
            <Input
              label="Email Address"
              type="email"
              required
              leftIcon={<Mail size={15} />}
              error={profileForm.formState.errors.email?.message}
              {...profileForm.register("email")}
            />
            <Input
              label="Institution / Affiliation"
              placeholder="University or organization"
              leftIcon={<Building size={15} />}
              hint="Your institutional affiliation for author profiles"
              error={profileForm.formState.errors.affiliation?.message}
              {...profileForm.register("affiliation")}
            />
            <div className="pt-2">
              <Button type="submit" loading={updateProfileMutation.isPending}>
                <Save size={15} />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Use a strong password with at least 8 characters
            </CardDescription>
          </CardHeader>
          <form
            onSubmit={passwordForm.handleSubmit((data) =>
              updatePasswordMutation.mutate(data),
            )}
            className="space-y-4"
          >
            <Input
              label="Current Password"
              type="password"
              required
              leftIcon={<Lock size={15} />}
              error={passwordForm.formState.errors.current_password?.message}
              {...passwordForm.register("current_password")}
            />
            <Input
              label="New Password"
              type="password"
              required
              leftIcon={<Lock size={15} />}
              hint="Minimum 8 characters"
              error={passwordForm.formState.errors.password?.message}
              {...passwordForm.register("password")}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              leftIcon={<Lock size={15} />}
              error={
                passwordForm.formState.errors.password_confirmation?.message
              }
              {...passwordForm.register("password_confirmation")}
            />
            <div className="pt-2">
              <Button type="submit" loading={updatePasswordMutation.isPending}>
                <Lock size={15} />
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <Card>
          <CardHeader>
            <CardTitle>My Roles</CardTitle>
            <CardDescription>
              Your assigned roles determine what you can do on the platform
            </CardDescription>
          </CardHeader>
          <div className="space-y-3">
            {profile?.roles?.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No roles assigned. Contact an administrator.
              </p>
            ) : (
              profile?.roles?.map((role: { name: string; slug: string }) => (
                <div
                  key={role.slug}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {role.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {role.slug.replace("_", " ")}
                    </p>
                  </div>
                  <span className="ml-auto px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
