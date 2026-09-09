const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://afeemhfiwwycrviamwoh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JHVIHMiYuEH8QRcdUMivbg_seguF2wS';

const accounts = [
    {
        name: "Admin",
        email: "ihm.irfan03@gmail.com",
        oldPassword: "IrfanBhai@12",
        newPassword: "admin@irfan"
    },
    {
        name: "Wholesale Shop",
        email: "wholesale@ihm.com",
        oldPassword: "password123",
        newPassword: "Wholesale@"
    },
    {
        name: "Shop 2",
        email: "shop2@ihm.com",
        oldPassword: "password123",
        newPassword: "shop2@"
    },
    {
        name: "Shop 3",
        email: "shop3@ihm.com",
        oldPassword: "password123",
        newPassword: "shop3@"
    }
];

async function updateAllPasswords() {
    console.log("Starting password updates...");

    for (const acc of accounts) {
        console.log(`\n--- Updating ${acc.name} (${acc.email}) ---`);
        const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { persistSession: false }
        });

        // 1. Try to sign in with old password
        let { data: signInData, error: signInError } = await client.auth.signInWithPassword({
            email: acc.email,
            password: acc.oldPassword
        });

        if (signInError) {
            console.log(`Could not login with old password (${signInError.message}). Checking if already updated to new password...`);
            const { error: testNewError } = await client.auth.signInWithPassword({
                email: acc.email,
                password: acc.newPassword
            });

            if (!testNewError) {
                console.log(`✓ Already updated and working with new password!`);
                continue;
            } else {
                console.log(`Trying signUp instead...`);
                const { error: signUpError } = await client.auth.signUp({
                    email: acc.email,
                    password: acc.newPassword
                });
                if (signUpError) {
                    console.error(`✕ Failed to create/update account: ${signUpError.message}`);
                } else {
                    console.log(`✓ Account signed up with new password!`);
                }
                continue;
            }
        }

        // 2. If signed in with old password, update to new password
        const { error: updateError } = await client.auth.updateUser({
            password: acc.newPassword
        });

        if (updateError) {
            console.error(`✕ Failed to update password: ${updateError.message}`);
        } else {
            console.log(`✓ Password updated to new password!`);
            
            // Verify with new password
            const verifyClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: { persistSession: false }
            });
            const { error: verifyError } = await verifyClient.auth.signInWithPassword({
                email: acc.email,
                password: acc.newPassword
            });

            if (verifyError) {
                console.error(`✕ Verification with new password failed: ${verifyError.message}`);
            } else {
                console.log(`✓ Verified! Login with new password succeeded.`);
            }
        }
    }

    console.log("\nFinished password updates.");
}

updateAllPasswords();
