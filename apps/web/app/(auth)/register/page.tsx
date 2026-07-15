"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Waves, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "What's your name?", field: "name", placeholder: "Your full name" },
  { id: 2, title: "Company name?", field: "company", placeholder: "Your company" },
  { id: 3, title: "What's your role?", field: "role", placeholder: "e.g. Engineer, Product Manager" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", company: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const current = steps[step]!;

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.name.toLowerCase().replace(/\s+/g, ".") + "@flowmind.ai",
            password: "demo1234",
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Registration failed");
          return;
        }
        router.push("/dashboard");
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }
  };

  const canProceed = form[current.field as keyof typeof form].trim().length > 0;

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-biolume-glow opacity-30" />
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-cobalto/5 rounded-full blur-[100px]" />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-12">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                i < step
                  ? "bg-biolume text-void"
                  : i === step
                  ? "bg-biolume/20 border border-biolume/50 text-biolume"
                  : "bg-white/5 text-white/30"
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : s.id}
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-[2px] transition-colors duration-300",
                  i < step ? "bg-biolume" : "bg-white/10"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm px-6"
        >
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-biolume/10 border border-biolume/30 flex items-center justify-center mx-auto mb-4">
              <Waves className="h-5 w-5 text-biolume" />
            </div>
            <h2 className="text-lg font-sora font-bold text-white">
              {current.title}
            </h2>
          </div>

          <label htmlFor="register-field" className="sr-only">{current.title}</label>
          <input
            id="register-field"
            autoFocus
            value={form[current.field as keyof typeof form]}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [current.field]: e.target.value }))
            }
            placeholder={current.placeholder}
            autoComplete="name"
            aria-required="true"
            className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-biolume/50 focus:ring-1 focus:ring-biolume/30 transition-all duration-300 mb-4"
            onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
          />

          {error && (
            <p className="text-xs text-destructive text-center mb-2" role="alert">{error}</p>
          )}
          <Button
            onClick={handleNext}
            variant="biolume"
            className="w-full h-11"
            disabled={!canProceed}
            loading={loading}
          >
            {step < steps.length - 1 ? (
              <>Next <ArrowRight className="h-4 w-4 ml-2" /></>
            ) : loading ? (
              "Creating account..."
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-center text-xs text-white/30 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-biolume/70 hover:text-biolume">
              Sign in
            </Link>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
