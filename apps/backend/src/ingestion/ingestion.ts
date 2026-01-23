// transactions are ordered by slot 
// {walletAddress, signature} is unique
// a tranaction is immuatble once started 
// ingestion resumes from lastProcessedSlot
// WS data can be out of order 
// RPC is the source of truth of recovery
// healthy = receiving WS data
// lagging = WS missed data, RPC catching up
// failed = RPC unavailable / repeated errors