import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSol(lamports: number): string {
  return (lamports / 1e9).toFixed(4)
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function generateRandomId(): string {
  return Math.random().toString(36).substr(2, 9)
}
