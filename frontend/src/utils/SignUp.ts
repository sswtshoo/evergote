export function getPasswordStrength(password: string): {
  score: number;
  missing: string[];
} {
  const missing: string[] = [];
  if (password.length < 8) missing.push("8+ characters");
  if (!/[A-Z]/.test(password)) missing.push("uppercase letter");
  if (!/[a-z]/.test(password)) missing.push("lowercase letter");
  if (!/[^A-Za-z0-9]/.test(password)) missing.push("special character");
  return { score: 4 - missing.length, missing };
}
