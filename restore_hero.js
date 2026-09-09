const fs = require('fs');

const heroSection = `                <!-- Decorative Hero Section -->
                <div class="glass-card"
                    style="margin-bottom: 2rem; padding: 0; overflow: hidden; height: 350px; display: flex; position: relative; background: linear-gradient(135deg, #111 0%, #000 100%);">
                    <div
                        style="flex: 1; padding: 4rem; display: flex; flex-direction: column; justify-content: center; z-index: 2; color: white;">
                        <div
                            style="width: 50px; height: 3px; background: #ffffff; margin-bottom: 1.5rem; opacity: 0.8; border-radius: 10px;">
                        </div>
                        <h2
                            style="font-size: 3.5rem; line-height: 1.1; margin-bottom: 1.5rem; font-family: 'Outfit'; font-weight: 800; letter-spacing: -2px; color: #ffffff !important; text-transform: none;">
                            Premium Mobiles,<br>Unbeatable Prices
                        </h2>
                        <p
                            style="color: rgba(255,255,255,0.7); max-width: 480px; line-height: 1.8; font-size: 1.1rem; border-left: 2px solid rgba(255,255,255,0.2); padding-left: 1.5rem; font-style: italic;">
                            Your ultimate destination for the latest smartphones, premium covers, and top-tier accessories.
                        </p>
                        <div style="margin-top: 2.5rem; display: flex; gap: 1.5rem; align-items: center;">
                            <button class="btn btn-primary" onclick="UI.showPage('pos')"
                                style="padding: 1rem 2.5rem; border-radius: 14px; border: 1px solid transparent; height: 55px; justify-content: center;">
                                <i class="fas fa-shopping-bag" style="margin-right: 0.5rem;"></i> New Sale
                            </button>
                            <button class="btn btn-ghost" onclick="UI.showPage('inventory')"
                                style="border: 1px solid rgba(255,255,255,0.1); color: white !important; padding: 1rem 2.5rem; border-radius: 14px; height: 55px; justify-content: center;">
                                <i class="fas fa-list" style="margin-right: 0.5rem;"></i> Browse List
                            </button>
                        </div>
                    </div>

                    <div
                        style="flex: 1; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        <!-- Decorative Abstract Shapes -->
                        <div
                            style="position: absolute; width: 300px; height: 300px; border-radius: 50%; background: #ffffff; filter: blur(120px); opacity: 0.05; animation: float 8s infinite ease-in-out;">
                        </div>
                        <div
                            style="position: absolute; inset: 0; background: url('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1000') center/cover; opacity: 0.2; mix-blend-mode: luminosity;">
                        </div>
                        <i class="fas fa-mobile-alt"
                            style="font-size: 12rem; color: var(--accent-primary); opacity: 0.03; transform: rotate(15deg);"></i>
                    </div>
                </div>`;

let content = fs.readFileSync('index.html', 'utf8');

if (content.includes('<!-- Decorative Hero Section -->')) {
    content = content.replace('<!-- Decorative Hero Section -->', heroSection);
}

fs.writeFileSync('index.html', content);

console.log('Restored hero section in index.html');
