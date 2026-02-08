//update ingestion state correctly
// no API shaped felids in this file

import { IngestionState } from "../models"
import { ingestionStore } from "../state/wallet.store"

export function updateIngestionState(
  walletId: string,
  updater: (prev: IngestionState) => IngestionState
) {
  const prev = ingestionStore.get(walletId)
  if (!prev) {
    throw new Error(`Missing ingestion state for wallet ${walletId}`)
  }

  const next = updater(prev)
  ingestionStore.set(walletId, next)
  return next
}