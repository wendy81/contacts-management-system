import {createClient} from "@supabase/supabase-js";


// You can take the URL from the project settings
export const createSupabase = (key: string) => createClient('https://mvfqsytmweybpyggujhb.supabase.co', key);