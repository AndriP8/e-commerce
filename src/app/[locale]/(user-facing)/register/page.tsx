"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/app/components/FormField";
import { useAuth } from "@/app/contexts/AuthContext";
import { Link, useRouter } from "@/i18n/navigation";
import {
  type RegisterWithConfirmInput,
  registerWithConfirmSchema,
} from "@/schemas/auth";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterWithConfirmInput>({
    resolver: zodResolver(registerWithConfirmSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (data: RegisterWithConfirmInput) => {
    setIsLoading(true);

    try {
      // Remove confirmPassword before sending to API if needed,
      // though the API schema might just ignore it if it's strict.
      // According to registerSchema in api-schemas.ts, it takes email, password, firstName, lastName.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      const success = await registerUser({
        ...registerData,
        firstName: registerData.firstName as string,
        lastName: registerData.lastName as string,
      });
      if (success) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("register.failed"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            {t("register.title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("links.hasAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t("login.title").toLowerCase()}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5">
            <FormField
              label={t("fields.firstName")}
              type="text"
              placeholder={t("fields.firstName")}
              registration={register("firstName")}
              error={errors.firstName}
              autoComplete="given-name"
              schema={registerWithConfirmSchema}
            />
            <FormField
              label={t("fields.lastName")}
              type="text"
              placeholder={t("fields.lastName")}
              registration={register("lastName")}
              error={errors.lastName}
              autoComplete="family-name"
              schema={registerWithConfirmSchema}
            />
            <FormField
              label={t("fields.email")}
              type="email"
              placeholder={t("fields.email")}
              registration={register("email")}
              error={errors.email}
              autoComplete="email"
              schema={registerWithConfirmSchema}
            />
            <FormField
              label={t("fields.password")}
              type={showPassword ? "text" : "password"}
              placeholder={t("fields.password")}
              registration={register("password")}
              error={errors.password}
              autoComplete="new-password"
              schema={registerWithConfirmSchema}
            >
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                aria-label={
                  showPassword
                    ? t("actions.hidePassword")
                    : t("actions.showPassword")
                }
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </FormField>
            <FormField
              label={t("fields.confirmPassword") || "Confirm Password"}
              type={showPassword ? "text" : "password"}
              placeholder={t("fields.confirmPassword") || "Confirm Password"}
              registration={register("confirmPassword")}
              error={errors.confirmPassword}
              autoComplete="new-password"
              schema={registerWithConfirmSchema}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? t("register.loading") : t("register.button")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
