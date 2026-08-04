import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, Building } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    affiliation: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      setAuth(response.user, response.access_token);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1a1a2e] font-serif">
          Create account
        </h2>
        <p className="text-[#565656] text-sm mt-2">
          Join the NJSEI research community
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          placeholder="Dr. John Adeyemi"
          required
          leftIcon={<User size={16} />}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@institution.edu.ng"
          required
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Institution / Affiliation"
          placeholder="University of Lagos"
          leftIcon={<Building size={16} />}
          error={errors.affiliation?.message}
          hint="Optional but recommended for author profiles"
          {...register("affiliation")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          leftIcon={<Lock size={16} />}
          error={errors.password?.message}
          hint="Minimum 8 characters"
          {...register("password")}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          required
          leftIcon={<Lock size={16} />}
          error={errors.password_confirmation?.message}
          {...register("password_confirmation")}
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          size="lg"
          className="mt-2"
        >
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-[#565656] mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#2A438C] font-medium hover:text-[#17254D]"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
