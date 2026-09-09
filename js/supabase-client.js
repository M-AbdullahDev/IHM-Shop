const SUPABASE_URL = 'https://afeemhfiwwycrviamwoh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JHVIHMiYuEH8QRcdUMivbg_seguF2wS';

// Initialize the Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SupabaseAuth = {
    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) throw error;
        return data;
    },

    async signUp(email, password) {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
        });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    },

    async getSession() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return session;
    },

    async getProfile(userId) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('role, shop_id')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    }
};

window.supabaseClient = supabaseClient;
window.SupabaseAuth = SupabaseAuth;
