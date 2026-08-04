/**
 * Extracts unique variable names enclosed in double curly braces {{variableName}}
 * from both HTML content and subject line.
 *
 * @param html - HTML string content of the template
 * @param subject - Subject line of the template
 * @returns Array of unique variable names
 */
export function extractVariables(html: string, subject: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variablesSet = new Set<string>();

  const combined = (subject || "") + " " + (html || "");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(combined)) !== null) {
    if (match[1]) {
      variablesSet.add(match[1]);
    }
  }

  return Array.from(variablesSet);
}
