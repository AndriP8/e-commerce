"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { registerUser } from "./data/mutation";
import { LoginSchema, loginSchema } from "./schema";

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginSchema) {
    const response = await registerUser(values);
    if (typeof response !== "string") {
      router.push("/backoffice");
    }

    if (response === "User not found" || response === "Invalid password") {
      toast({
        title: "Error",
        description: "Email or Password is incorrect",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Enter your email below to register an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  name="email"
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  name="password"
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                        suffixIcon={
                          <Button
                            variant="link"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <EyeClosed className="text-muted-foreground cursor-pointer" />
                          </Button>
                        }
                      />
                      <FormMessage />
                    </div>
                  )}
                />
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
