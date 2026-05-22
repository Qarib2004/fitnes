import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

type SupabaseClientOptions = NonNullable<Parameters<typeof createClient>[2]>
type RealtimeTransport = NonNullable<
  NonNullable<SupabaseClientOptions['realtime']>['transport']
>

export const createSupabaseServerClient = (url: string, key: string) =>
  createClient(url, key, {
    auth: { persistSession: false },
    realtime: {
      transport: ws as unknown as RealtimeTransport
    }
  })
