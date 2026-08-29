export function matchesNameSearch(query, value) {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  return (value ?? '').toLowerCase().includes(normalized)
}
