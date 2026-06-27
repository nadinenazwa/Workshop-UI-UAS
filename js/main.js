document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 1. ROUTE GUARDING (Proteksi Halaman)
    // Halaman yang memerlukan login terlebih dahulu.
    // Jika user belum login, tampilkan alert dan
    // redirect otomatis ke login.html.
    // =============================================
    const protectedPages = ['keranjang.html', 'pembayaran.html', 'history.html'];

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
            </a>
            <a href="history.html" class="btn btn-icon" title="Riwayat Transaksi">
                <i class="fa-solid fa-clock-rotate-left"></i>
            </a>
            <div class="nav-user-profile" style="display:flex;align-items:center;gap:0.5rem;">
                <div style="width:34px;height:34px;border-radius:50%;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;">
                    ${userName.charAt(0).toUpperCase()}
                </div>
                <span style="font-weight:600;font-size:0.875rem;color:var(--text-main);">${userName}</span>
            </div>
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

});
