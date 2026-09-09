const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://afeemhfiwwycrviamwoh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JHVIHMiYuEH8QRcdUMivbg_seguF2wS';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAccounts() {
    const accounts = [
        {
            name: "Admin",
            email: "ihm.irfan03@gmail.com",
            password: "admin@irfan",
            metadata: { full_name: "Admin IHM", role: "admin" }
        },
        {
            name: "Wholesale Shop",
            email: "wholesale@ihm.com",
            password: "Wholesale@",
            metadata: { full_name: "Wholesale Staff", role: "shopkeeper" }
        },
        {
            name: "Shop 2",
            email: "shop2@ihm.com",
            password: "shop2@",
            metadata: { full_name: "Shop 2 Staff", role: "shopkeeper" }
        },
        {
            name: "Shop 3",
            email: "shop3@ihm.com",
            password: "shop3@",
            metadata: { full_name: "Shop 3 Staff", role: "shopkeeper" }
        }
    ];

    for (const acc of accounts) {
        console.log(`Creating ${acc.name} (${acc.email})...`);
        const { data, error } = await supabase.auth.signUp({
            email: acc.email,
            password: acc.password,
            options: {
                data: acc.metadata
            }
        });

        if (error) {
            console.error(`  -> Error:`, error.message);
        } else {
            console.log(`  -> Success! User ID:`, data.user.id);
        }
    }

    console.log("Finished creating accounts.");
}

createAccounts();
