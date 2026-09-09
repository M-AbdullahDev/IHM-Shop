const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://afeemhfiwwycrviamwoh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JHVIHMiYuEH8QRcdUMivbg_seguF2wS';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSignup() {
    console.log("Attempting signup...");
    const { data, error } = await supabase.auth.signUp({
        email: 'ihm.irfan03@gmail.com',
        password: 'IrfanBhai@12',
    });
    
    if (error) {
        console.error("Signup error:", error);
    } else {
        console.log("Signup success:", data);
    }
}

testSignup();
