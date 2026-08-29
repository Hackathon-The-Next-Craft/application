import { redirect } from "next/navigation";

// Única entrada del entrevistador. Si no hay sesión iniciada, proxy.ts
// intercepta /dashboard y rebota a /signin.
export default function Home() {
  redirect("/dashboard");
}
