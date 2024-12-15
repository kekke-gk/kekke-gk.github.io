'use server'

const API_URL = 'https://wiki.factorio.com/api.php'

const DEFAULT_PARAMS = {
  action: 'query',
  format: 'json',
}

export async function request<T>(parameters: object): Promise<T> {
  const params = {
    ...parameters,
    ...DEFAULT_PARAMS,
  }

  const query = new URLSearchParams(params)
  const res = await fetch(API_URL + `?${query}`)
  const json = await res.json()
  return json as T
}
