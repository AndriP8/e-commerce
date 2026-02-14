"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/schemas/auth";
import { FormField } from "@/app/components/FormField";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const success = await login(data.email, data.password);
      if (success) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("login.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">{t("login.title")}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("links.noAccount")}{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              {t("register.title").toLowerCase()}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5">
            <FormField
              label={t("fields.email")}
              type="email"
              placeholder={t("fields.emailPlaceholder")}
              registration={register("email")}
              error={errors.email}
              autoComplete="email"
              schema={loginSchema}
            />
            <FormField
              label={t("fields.password")}
              type={showPassword ? "text" : "password"}
              placeholder={t("fields.passwordPlaceholder")}
              registration={register("password")}
              error={errors.password}
              autoComplete="current-password"
              schema={loginSchema}
            >
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                aria-label={showPassword ? t("actions.hidePassword") : t("actions.showPassword")}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </FormField>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? t("login.loading") : t("login.button")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
