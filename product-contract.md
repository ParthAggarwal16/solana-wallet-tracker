the main markdown file :

version 1 :
--- PRODUCT SCOPE :

this app lets user sign in (email) , add wallets (phantom , metamask , backpack)
then user can track all the tranactions at one place with graphs showing different wallet
tracjectries
this will also have basic features like showing TPS , count , solana market graph

SUPPORTED FEATURES :

- this version tracks upto 100 wallets max
- lets us view transaction history (full history)
- lets us view basic transactions
- view basic analytics (count, volume)

things i will avoid :
-sending sol

- signing transaction
- multi chain
- token transfers
- NFTs

core gaurentees :

- transactions are ordered by slots
- no transaction is showed twice
- restart does not lose history or anything

-- failuire models :

- what happens if solana RPC fails ?
- the system temporarily stops ingesting new transactions
- already ingested and stored transaction history remains available to users
- once RPC connectivity is restored, the system resumes ingestion from the last processed slot, without duplicating
  transactions

- what happens if WS disconnects ?
- The system detects the disconnect and falls back to recovery mode.
- On reconnection, the system re-syncs missed transactions using RPC, starting from the last confirmed slot.
- No transaction is missed or duplicated due to WS disconnections.

- what happens if backend restarts ?
- All previously tracked wallets and their transaction history remain intact.
- On startup, the backend resumes processing from the last persisted state (last processed slot per wallet).
- Restart does not cause loss, duplication, or reordering of transactions.
