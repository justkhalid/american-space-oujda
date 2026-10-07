"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "@/store/router";
import { useI18n } from "@/store/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section, MatteCard, Pill } from "@/components/site/primitives";
import { LogIn, Loader2, ShieldCheck, GraduationCap, PenSquare, Eye, EyeOff, Library } from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useRouter((s) => s.navigate);
  const t = useI18n((s) => s.t);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      toast.error(t("login.invalid"));
      return;
    }
    toast.success(t("login.success"));
    // Fetch session to determine role and redirect
    setTimeout(async () => {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;
      if (role === "ADMIN") navigate({ name: "admin" });
      else if (role === "TEACHER") navigate({ name: "teacher" });
      else if (role === "EDITOR") navigate({ name: "editor" });
      else if (role === "LIBRARY") navigate({ name: "library-dashboard" });
      else navigate({ name: "home" });
    }, 200);
  };

  const fillDemo = (role: "admin" | "teacher" | "editor" | "library") => {
    if (role === "admin") {
      setEmail("admin@asoujda.ma");
      setPassword("admin123");
    } else if (role === "teacher") {
      setEmail("sarah.benali@asoujda.ma");
      setPassword("teacher123");
    } else if (role === "library") {
      setEmail("library@asoujda.ma");
      setPassword("library123");
    } else {
      setEmail("editor@asoujda.ma");
      setPassword("editor123");
    }
  };

  return (
    <Section className="!pt-16">
      <div className="max-w-md mx-auto">
        <MatteCard>
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl tracking-tight">{t("login.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("login.subtitle")}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">{t("login.email")}</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.placeholder.email")}
                autoComplete="email"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">{t("login.password")}</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.placeholder.password")}
                  autoComplete="current-password"
                  className="pr-10 rtl:pl-10 rtl:pr-3"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 rtl:left-2 rtl:right-auto top-1/2 -translate-y-1/2 w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground"
                  aria-label={showPw ? t("login.hide") : t("login.show")}
                >
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("login.signing")}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {t("login.signin")}
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-border">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 text-center">
              {t("login.demo")}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("admin")}
                className="tap rounded-xl border border-border p-2.5 text-left rtl:text-right hover:border-primary/40 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-accent mb-1" />
                <div className="text-xs font-medium">{t("login.demo.admin")}</div>
                <div className="text-[10px] text-muted-foreground">{t("login.demo.admin.body")}</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("teacher")}
                className="tap rounded-xl border border-border p-2.5 text-left rtl:text-right hover:border-primary/40 transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 text-accent mb-1" />
                <div className="text-xs font-medium">{t("login.demo.teacher")}</div>
                <div className="text-[10px] text-muted-foreground">{t("login.demo.teacher.body")}</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("library")}
                className="tap rounded-xl border border-border p-2.5 text-left rtl:text-right hover:border-primary/40 transition-colors"
              >
                <Library className="w-3.5 h-3.5 text-accent mb-1" />
                <div className="text-xs font-medium">{t("login.demo.library")}</div>
                <div className="text-[10px] text-muted-foreground">{t("login.demo.library.body")}</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("editor")}
                className="tap rounded-xl border border-border p-2.5 text-left rtl:text-right hover:border-primary/40 transition-colors"
              >
                <PenSquare className="w-3.5 h-3.5 text-accent mb-1" />
                <div className="text-xs font-medium">{t("login.demo.editor")}</div>
                <div className="text-[10px] text-muted-foreground">{t("login.demo.editor.body")}</div>
              </button>
            </div>
          </div>
        </MatteCard>
      </div>
    </Section>
  );
}
