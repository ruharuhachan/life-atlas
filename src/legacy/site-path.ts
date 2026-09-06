export function sitePath(path: string) {
  return path.startsWith('http') ? path : '/niigata' + path;
}
