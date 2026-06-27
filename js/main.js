document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 1. ROUTE GUARDING (Proteksi Halaman)
    // Halaman yang memerlukan login terlebih dahulu.
    // Jika user belum login, tampilkan alert dan
    // redirect otomatis ke login.html.
    // =============================================
    const protectedPages = ['keranjang.html', 'pembayaran.html', 'history.html', 'sukses.html', 'booking.html', 'konfirmasi-booking.html', 'profil.html'];

    // Ambil nama file halaman saat ini dari URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Cek apakah user sudah login via localStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Jika halaman saat ini termasuk halaman terproteksi DAN user belum login
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
        // Tampilkan peringatan kepada pengguna
        alert('⚠️ Kamu harus login terlebih dahulu untuk mengakses halaman ini.');
        // Redirect paksa ke halaman login
        window.location.href = 'login.html';
        return; // Hentikan eksekusi script selanjutnya
    }


    // =============================================
    // 2. DYNAMIC NAVBAR (Tampilan Login/Logout)
    // Mengubah tombol "Masuk/Daftar" di navbar menjadi
    // ikon profil + tombol "Keluar" ketika user sudah login.
    // =============================================
    const navActions = document.querySelector('.nav-actions');

    if (navActions && isLoggedIn) {
        // Ambil nama user dari localStorage (default: "Siswa")
        const userName = localStorage.getItem('userName') || 'Siswa';

        // Ganti konten nav-actions dengan profil user + tombol logout
        // Simpan referensi mobile menu button sebelum replace
        const mobileBtn = navActions.querySelector('.mobile-menu-btn');
        const mobileBtnHTML = mobileBtn ? mobileBtn.outerHTML : '';

        navActions.innerHTML = `
            <a href="keranjang.html" class="btn btn-icon" title="Keranjang" style="position:relative;">
                <i class="fa-solid fa-cart-shopping"></i>
                <span id="cart-badge" style="position:absolute; top:-5px; right:-5px; background:var(--danger); color:white; font-size:10px; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; display:none;">0</span>
            </a>
            <a href="history.html" class="btn btn-icon" title="Riwayat Transaksi">
                <i class="fa-solid fa-clock-rotate-left"></i>
            </a>
            <a href="profil.html" class="nav-user-profile" style="display:flex;align-items:center;gap:0.5rem;text-decoration:none;cursor:pointer;">
                <div style="width:34px;height:34px;border-radius:50%;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;">
                    ${userName.charAt(0).toUpperCase()}
                </div>
                <span style="font-weight:600;font-size:0.875rem;color:var(--text-main);">${userName}</span>
            </a>
            <button class="btn btn-outline btn-sm" id="btn-logout" style="border-color:var(--danger);color:var(--danger);">
                <i class="fa-solid fa-right-from-bracket"></i> Keluar
            </button>
            ${mobileBtnHTML}
        `;

        // Event handler untuk tombol Logout
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Hapus semua data sesi dari localStorage
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                // Redirect ke halaman beranda dalam keadaan logout
                window.location.href = 'index.html';
            });
        }
    }


    // =============================================
    // 3. MOBILE MENU TOGGLE
    // =============================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const menuIcon = mobileMenuBtn ? mobileMenuBtn.querySelector('i') : null;

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle icon bars ↔ times
            if (menuIcon) {
                if (navLinks.classList.contains('active')) {
                    menuIcon.classList.remove('fa-bars');
                    menuIcon.classList.add('fa-times');
                } else {
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                }
            }
        });
    }


    // =============================================
    // 4. HEADER SCROLL EFFECT
    // =============================================
    const header = document.querySelector('header');

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }


    // =============================================
    // 5. SMOOTH SCROLL untuk Anchor Links
    // =============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Tutup mobile menu jika sedang terbuka
                    if (navLinks && navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        if (menuIcon) {
                            menuIcon.classList.remove('fa-times');
                            menuIcon.classList.add('fa-bars');
                        }
                    }
                }
            }
        });
    });


    // =============================================
    // 6. SCROLL ANIMATION (Fade-In On Scroll)
    // =============================================
    const animateElements = document.querySelectorAll('.feature-card, .tutor-card, .product-card, .article-card');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(el);
    });


    // =============================================
    // 7. AUTH: Smart Login Handler
    // Menangani form login dengan role-based redirect:
    //   - admin@tutorin.com + admin123 → dashboard.html
    //   - Email lainnya → simpan sesi di localStorage,
    //     lalu redirect ke index.html
    // =============================================
    const loginForm = document.getElementById('login-form');
    const loginBtn  = document.getElementById('btn-login');

    if (loginForm && loginBtn) {
        loginForm.addEventListener('submit', (e) => {
            // Mencegah reload halaman bawaan browser
            e.preventDefault();

            // Ambil nilai email dan password dari input
            const email    = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            // Validasi sederhana: pastikan kedua field terisi
            if (!email || !password) {
                alert('Mohon isi email dan password terlebih dahulu.');
                return;
            }

            // Tampilkan animasi loading pada tombol submit
            loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
            loginBtn.disabled = true;
            loginBtn.style.opacity = '0.7';

            // Simulasi proses autentikasi (delay 1.8 detik)
            setTimeout(() => {
                // Ubah tampilan tombol menjadi status berhasil
                loginBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Berhasil! Mengalihkan...';
                loginBtn.style.background = 'var(--success)';
                loginBtn.style.opacity = '1';
                loginBtn.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.3)';

                // ── Logika Pengkondisian Kredensial ──
                let redirectUrl;

                if (email === 'admin@tutorin.com' && password === 'admin123') {
                    // ADMIN: Simpan role admin & redirect ke panel admin
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userName', 'Admin');
                    localStorage.setItem('userEmail', email);
                    redirectUrl = 'dashboard.html';

                } else {
                    // SISWA/UMUM: Simpan sesi login & redirect ke beranda
                    localStorage.setItem('isLoggedIn', 'true');
                    // Ambil nama dari bagian email sebelum @ sebagai display name
                    const displayName = email.split('@')[0]
                        .replace(/[._]/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase());
                    localStorage.setItem('userName', displayName);
                    localStorage.setItem('userEmail', email);
                    redirectUrl = 'index.html';
                }

                // Redirect setelah 1.5 detik agar user bisa melihat pesan sukses
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1500);
            }, 1800);
        });
    }


    // =============================================
    // 8. AUTH: Register Form Handler
    // Setelah daftar berhasil, otomatis login dan
    // redirect ke halaman beranda.
    // =============================================
    const registerForm = document.getElementById('register-form');
    const registerBtn  = document.getElementById('btn-register');

    if (registerForm && registerBtn) {
        registerForm.addEventListener('submit', (e) => {
            // Mencegah reload halaman bawaan
            e.preventDefault();

            // Ambil data dari form
            const name    = document.getElementById('reg-name').value.trim();
            const email   = document.getElementById('reg-email').value.trim();
            const pw      = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;

            // Validasi: pastikan password dan konfirmasi cocok
            if (pw !== confirm) {
                alert('Password dan Konfirmasi Password tidak sama!');
                return;
            }

            // Tampilkan animasi loading
            registerBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Membuat akun...';
            registerBtn.disabled = true;
            registerBtn.style.opacity = '0.7';

            // Simulasi proses pendaftaran (delay 2 detik)
            setTimeout(() => {
                // Status berhasil
                registerBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Akun Berhasil Dibuat!';
                registerBtn.style.background = 'var(--success)';
                registerBtn.style.opacity = '1';
                registerBtn.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.3)';

                // Otomatis login: simpan sesi ke localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userName', name || 'Siswa');
                localStorage.setItem('userEmail', email);

                // Redirect ke halaman beranda dengan status sudah login
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }, 2000);
        });
    }


    // =============================================
    // 9. AUTH: Toggle Password Visibility
    // Handler show/hide password di semua form auth
    // =============================================
    const passwordToggles = [
        { btn: 'toggle-login-pw',    input: 'login-password' },
        { btn: 'toggle-reg-pw',      input: 'reg-password' },
        { btn: 'toggle-reg-confirm', input: 'reg-confirm' }
    ];

    passwordToggles.forEach(({ btn, input }) => {
        const toggleBtn = document.getElementById(btn);
        const pwInput   = document.getElementById(input);

        if (toggleBtn && pwInput) {
            toggleBtn.addEventListener('click', () => {
                // Toggle tipe input antara 'password' dan 'text'
                const isPassword = pwInput.type === 'password';
                pwInput.type = isPassword ? 'text' : 'password';
                // Toggle ikon mata (eye ↔ eye-slash)
                toggleBtn.querySelector('i').classList.toggle('fa-eye');
                toggleBtn.querySelector('i').classList.toggle('fa-eye-slash');
            });
        }
    });

    // =============================================
    // 10. E-COMMERCE: Cart & Transactions
    // =============================================
    
    // Update Cart Badge on Navbar
    window.updateCartBadge = function() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length > 0) {
                badge.style.display = 'flex';
                badge.innerText = cart.length;
            } else {
                badge.style.display = 'none';
            }
        }
    };
    window.updateCartBadge(); // Initial call

    // Add item to cart
    window.addToCart = function(btnElement) {
        if (!localStorage.getItem('isLoggedIn')) {
            alert('Silakan login terlebih dahulu untuk menambah ke keranjang.');
            window.location.href = 'login.html';
            return;
        }
        
        const id = btnElement.getAttribute('data-id');
        const name = btnElement.getAttribute('data-name');
        const price = parseInt(btnElement.getAttribute('data-price'));
        const img = btnElement.getAttribute('data-img');
        const cat = btnElement.getAttribute('data-cat');
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if item already exists
        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id, name, price, img, cat, qty: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        window.updateCartBadge();
        
        // Simple visual feedback
        const originalText = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="fa-solid fa-check"></i> Ditambahkan';
        btnElement.style.background = 'var(--success)';
        btnElement.style.color = 'white';
        setTimeout(() => {
            btnElement.innerHTML = originalText;
            btnElement.style.background = '';
            btnElement.style.color = '';
        }, 1500);
    };

    // Render Cart in keranjang.html
    window.renderCart = function() {
        const tbody = document.querySelector('#cart-table tbody');
        if (!tbody) return; // Only run on keranjang.html
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:3rem;">Keranjang kamu masih kosong. <a href="produk.html" style="color:var(--primary);font-weight:600;">Belanja sekarang!</a></td></tr>';
            window.recalcCart();
            return;
        }
        
        let html = '';
        cart.forEach((item, index) => {
            const subtotal = item.price * item.qty;
            html += `
                <tr id="cart-row-${index}">
                    <td>
                        <div class="cart-item-info">
                            <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                            <div class="cart-item-details">
                                <h4>${item.name}</h4>
                                <span class="cart-item-cat">${item.cat}</span>
                            </div>
                        </div>
                    </td>
                    <td data-label="Harga">
                        <span class="cart-price">Rp ${item.price.toLocaleString('id-ID')}</span>
                    </td>
                    <td data-label="Jumlah">
                        <div class="cart-qty" data-index="${index}">
                            <button type="button" onclick="updateQty(${index}, -1)" aria-label="Kurangi">−</button>
                            <input type="number" value="${item.qty}" readonly aria-label="Jumlah">
                            <button type="button" onclick="updateQty(${index}, 1)" aria-label="Tambah">+</button>
                        </div>
                    </td>
                    <td data-label="Subtotal">
                        <span class="cart-price" id="subtotal-${index}">Rp ${subtotal.toLocaleString('id-ID')}</span>
                    </td>
                    <td>
                        <button class="cart-remove" aria-label="Hapus item" onclick="removeFromCart(${index})">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        window.recalcCart();
    };

    window.updateQty = function(index, delta) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart[index]) {
            cart[index].qty += delta;
            if (cart[index].qty < 1) cart[index].qty = 1;
            if (cart[index].qty > 99) cart[index].qty = 99;
            localStorage.setItem('cart', JSON.stringify(cart));
            window.renderCart();
        }
    };

    window.removeFromCart = function(index) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        window.updateCartBadge();
        window.renderCart();
    };

    window.recalcCart = function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let totalQty = 0;
        let subtotal = 0;
        
        cart.forEach(item => {
            totalQty += item.qty;
            subtotal += (item.price * item.qty);
        });
        
        const summaryCard = document.getElementById('cart-summary-card');
        if (summaryCard) {
            if (cart.length === 0) {
                summaryCard.style.opacity = '0.5';
                document.getElementById('btn-checkout').style.pointerEvents = 'none';
            } else {
                summaryCard.style.opacity = '1';
                document.getElementById('btn-checkout').style.pointerEvents = 'auto';
            }
            
            // Update labels
            const labels = summaryCard.querySelectorAll('.summary-row .label');
            const values = summaryCard.querySelectorAll('.summary-row .value');
            if (labels.length > 0 && values.length > 0) {
                labels[0].innerText = `Subtotal (${totalQty} item)`;
                values[0].innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
                
                // Final total (last value element)
                values[values.length - 1].innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
            }
        }
    };

    // Run renderCart if on keranjang page
    if (window.location.pathname.includes('keranjang.html')) {
        window.renderCart();
    }

    // Checkout Logic (run in pembayaran.html)
    window.checkout = function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) return;
        
        let subtotal = 0;
        cart.forEach(item => subtotal += (item.price * item.qty));
        const total = subtotal + 1000; // adding 1000 for service fee
        
        const methodEl = document.querySelector('input[name="payment"]:checked');
        const method = methodEl ? methodEl.value : 'qris';
        
        const txns = JSON.parse(localStorage.getItem('transactions')) || [];
        
        const d = new Date();
        const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') + ' WIB';
        
        const newTx = {
            id: 'TRX-' + d.getFullYear() + (d.getMonth()+1).toString().padStart(2,'0') + d.getDate().toString().padStart(2,'0') + '-' + Math.floor(Math.random() * 1000).toString().padStart(3,'0'),
            date: dateStr,
            items: cart,
            total: total,
            method: method,
            status: 'success'
        };
        
        txns.unshift(newTx);
        localStorage.setItem('transactions', JSON.stringify(txns));
        localStorage.removeItem('cart'); // clear cart
    };
    
    // Render History
    window.renderHistory = function() {
        const list = document.getElementById('history-list');
        if (!list) return; // Only run on history.html
        
        const txns = JSON.parse(localStorage.getItem('transactions')) || [];
        
        if (txns.length === 0) {
            list.innerHTML = '<div style="text-align:center; padding:3rem; background:var(--surface); border-radius:var(--radius-lg);">Belum ada riwayat transaksi. <a href="produk.html" style="color:var(--primary);font-weight:600;">Belanja sekarang!</a></div>';
            return;
        }
        
        let html = '';
        txns.forEach((tx, idx) => {
            let itemsHtml = '';
            tx.items.slice(0, 2).forEach(item => {
                itemsHtml += `
                    <div class="trx-item-thumb">
                        <img src="${item.img}" alt="${item.name}">
                        ${item.name}
                    </div>
                `;
            });
            
            if (tx.items.length > 2) {
                itemsHtml += `<div class="trx-item-more">+${tx.items.length - 2} lainnya</div>`;
            }
            
            html += `
            <article class="trx-card" id="${tx.id}">
                <div class="trx-header">
                    <div class="trx-id-group">
                        <div class="trx-icon">
                            <i class="fa-solid fa-bag-shopping"></i>
                        </div>
                        <div class="trx-id-text">
                            <h4>${tx.id}</h4>
                            <span><i class="fa-regular fa-calendar" style="margin-right: 0.25rem;"></i>${tx.date}</span>
                        </div>
                    </div>
                    <span class="trx-badge success"><i class="fa-solid fa-circle-check" style="margin-right: 0.25rem;"></i>Sukses</span>
                </div>
                <div class="trx-items">
                    ${itemsHtml}
                </div>
                <div class="trx-footer">
                    <div>
                        <span class="trx-total-label">Total Pembayaran</span>
                        <div class="trx-total-value">Rp ${tx.total.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="trx-actions">
                        <a href="#" class="btn btn-outline btn-sm"><i class="fa-solid fa-file-invoice"></i> Invoice</a>
                        <a href="produk.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-rotate-right"></i> Beli Lagi</a>
                    </div>
                </div>
            </article>
            `;
        });
        
        list.innerHTML = html;
        document.querySelector('.result-count strong').innerText = txns.length;
    };
    
    if (window.location.pathname.includes('history.html')) {
        window.renderHistory();
    }


    // =============================================
    // 11. ADMIN PANEL: Delete Modal Logic
    // =============================================
    window.showDeleteModal = function(rowElement) {
        // Create modal if not exists
        let modal = document.getElementById('admin-delete-modal');
        if (!modal) {
            const modalHtml = `
                <div class="admin-modal-overlay" id="admin-delete-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center; backdrop-filter:blur(2px);">
                    <div class="admin-modal-content" style="background:var(--admin-surface, #fff); padding:2rem; border-radius:0.75rem; width:100%; max-width:400px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.1); transform:scale(0.95); transition:transform 0.2s ease;">
                        <div style="width:60px; height:60px; background:#FEE2E2; color:#EF4444; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 1.5rem;">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <h3 style="font-size:1.25rem; font-weight:700; color:var(--admin-text-main, #0F172A); margin-bottom:0.5rem;">Yakin ingin menghapus?</h3>
                        <p style="color:var(--admin-text-muted, #64748B); font-size:0.9rem; margin-bottom:2rem;">Data yang dihapus tidak dapat dikembalikan lagi.</p>
                        <div style="display:flex; gap:1rem; justify-content:center;">
                            <button id="btn-modal-cancel" class="btn-admin btn-admin-outline" style="flex:1;">Batal</button>
                            <button id="btn-modal-confirm" class="btn-admin btn-admin-primary" style="flex:1; background:#EF4444; box-shadow:none;">Hapus</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            modal = document.getElementById('admin-delete-modal');
            
            document.getElementById('btn-modal-cancel').addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        modal.style.display = 'flex';
        // Add tiny delay for animation
        setTimeout(() => {
            modal.querySelector('.admin-modal-content').style.transform = 'scale(1)';
        }, 10);
        
        const confirmBtn = document.getElementById('btn-modal-confirm');
        
        // Remove old listeners to avoid multiple fires
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (rowElement) {
                rowElement.style.opacity = '0';
                rowElement.style.transform = 'translateX(-20px)';
                rowElement.style.transition = 'all 0.3s ease';
                setTimeout(() => rowElement.remove(), 300);
            }
        });
    };

    // Attach click event to all delete buttons in admin
    const deleteBtns = document.querySelectorAll('.btn-action-delete');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const row = btn.closest('tr');
            window.showDeleteModal(row);
        });
    });

    // =============================================
    // 16. PROFILE PAGE POPULATION
    // =============================================
    if (currentPage === 'profil.html' && isLoggedIn) {
        const userName = localStorage.getItem('userName') || 'Siswa';
        const userEmail = localStorage.getItem('userEmail') || 'siswa@tutorin.id';
        
        const profileNameEls = document.querySelectorAll('.profile-name, #fullname');
        const profileEmailEls = document.querySelectorAll('.profile-email, #email');
        const avatarInitial = document.querySelectorAll('.profile-avatar-wrapper .profile-avatar');
        
        profileNameEls.forEach(el => {
            if (el.tagName === 'INPUT') el.value = userName;
            else el.textContent = userName;
        });
        
        profileEmailEls.forEach(el => {
            if (el.tagName === 'INPUT') el.value = userEmail;
            else el.textContent = userEmail;
        });
        
        avatarInitial.forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = `https://placehold.co/200x200/4F46E5/FFFFFF?text=${userName.charAt(0).toUpperCase()}`;
            }
        });
    }

});
