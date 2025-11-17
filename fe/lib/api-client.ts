import { Account } from './types'

export async function fetchTwitterData(account: 'disney' | 'netflix'): Promise<Account> {
  const response = await fetch(`/api/twitter-data?account=${account}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${account} data: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchBothAccounts(): Promise<{
  disney: Account
  netflix: Account
}> {
  const [disney, netflix] = await Promise.all([
    fetchTwitterData('disney'),
    fetchTwitterData('netflix'),
  ])

  return { disney, netflix }
}

export async function extractTopics(texts: string[], numTopics: number = 5) {
  const response = await fetch('/api/topics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texts, numTopics })
  })

  if (!response.ok) {
    throw new Error('Failed to extract topics')
  }

  return response.json()
}
