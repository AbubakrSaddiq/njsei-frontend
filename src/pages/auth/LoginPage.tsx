import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      setAuth(response.user, response.access_token);
      toast.success(`Welcome back, ${response.user.name}!`);
      navigate("/dashboard");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1a1a2e] font-serif">
          Welcome back
        </h2>
        <p className="text-[#565656] text-sm mt-2">
          Sign in to access your NJSEI account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@institution.edu"
          required
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          leftIcon={<Lock size={16} />}
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-[#E2E6F0] text-[#2A438C]"
            />
            <span className="text-sm text-[#565656]">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-[#2A438C] hover:text-[#17254D] font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-[#565656] mt-6">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-[#2A438C] font-medium hover:text-[#17254D]"
        >
          Create account
        </Link>
      </p>
      {/* Dev helper - remove in production */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs font-medium text-blue-700 mb-2">
          Quick Login (Dev)
        </p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              setValue("email", "alice@example.com");
              setValue("password", "password123");
            }}
            className="block text-xs text-blue-600 hover:underline"
          >
            Login as Author (Alice)
          </button>
          <button
            type="button"
            onClick={() => {
              setValue("email", "editor@njsei.com");
              setValue("password", "password123");
            }}
            className="block text-xs text-blue-600 hover:underline"
          >
            Login as Editor
          </button>
          <button
            type="button"
            onClick={() => {
              setValue("email", "reviewer@njsei.com");
              setValue("password", "password123");
            }}
            className="block text-xs text-blue-600 hover:underline"
          >
            Login as Reviewer
          </button>
        </div>
      </div>
    </Card>
  );
}
