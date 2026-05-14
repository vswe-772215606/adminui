"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";

export function LoginView() {
  const router = useRouter();
  const login = useAuth((s) => s.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(username, password);
    if (ok) {
      router.replace("/");
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Building2 className="size-6" strokeWidth={1.75} />
          </div>
          <h1 className="mt-3 font-heading text-xl font-semibold tracking-tight text-foreground">
            {t.marketName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.loginSubtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-xl bg-card p-5 ring-1 ring-foreground/10"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">{t.username}</Label>
              <Input
                id="username"
                name="username"
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(false);
                }}
                placeholder={t.usernamePlaceholder}
                aria-invalid={error}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  className="pr-9"
                  aria-invalid={error}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={showPassword ? t.password : t.password}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {t.wrongCredentials}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full">
              <LogIn />
              {t.signIn}
            </Button>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            admin / admin
          </p>
        </form>
      </div>
    </div>
  );
}
