import ora from "ora";

export function spinner(text = "processing ...") {
  return ora(text);
}