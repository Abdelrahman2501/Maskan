import { redirect } from "next/navigation";

// Applicants register in the mobile app (ADR-0003); send visitors to the download section.
export default function RegisterPage() {
  redirect("/#download");
}
