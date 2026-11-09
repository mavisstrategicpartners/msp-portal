/** Password and email rules shared by the reset page (browser) and the server. */
export function normaliseEmail(raw: string) {
  return (raw || "").trim().toLowerCase();
}

export const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8 && p.length <= 72,
  },
  { id: "lower", label: "A lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "upper", label: "An uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", label: "A number", test: (p: string) => /[0-9]/.test(p) },
];

/** Password rules shared by the page and the server. */
export function passwordProblems(password: string, email = ""): string[] {
  const p = password || "";
  const problems: string[] = [];
  if (p.length < 8) problems.push("at least 8 characters");
  if (p.length > 72) problems.push("no more than 72 characters");
  if (!/[a-z]/.test(p)) problems.push("a lowercase letter");
  if (!/[A-Z]/.test(p)) problems.push("an uppercase letter");
  if (!/[0-9]/.test(p)) problems.push("a number");
  if (email && p.toLowerCase() === normaliseEmail(email))
    problems.push("must not be your email address");
  return problems;
}
