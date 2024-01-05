export function get(obj: object, path: string[], defaultValue: any) {
  let res = obj as any
  for (const key of path) {
    const value = res[key]
    if (res[key] === undefined) return defaultValue
    res = res[key]
  }
  return res
}
