export const maskString = (input: {
  str: string;
  start?: number; // Unmasked characters at the start
  end?: number; // Unmasked characters at the end
}) => {
  if (!input.str) return "";

  const { str } = input;
  const start = input.start ?? 0;
  const end = input.end ?? 0;

  // Return unchanged if the string is shorter than the unmasked boundaries
  if (str.length <= start + end) {
    return str;
  }

  const maskLength = str.length - start - end;
  const mask = "*";

  return (
    str.slice(0, start) + mask.repeat(maskLength) + str.slice(str.length - end)
  );
};
