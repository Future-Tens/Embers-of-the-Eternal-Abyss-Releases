// 首頁：向 GitHub 查詢最新的 Release，顯示版本號並把下載按鈕換成檔案的直接連結
// 查不到 (還沒有 Release、網路錯誤、超過 API 次數限制) 時維持原本的「前往下載頁面」
const REPO = 'Future-Tens/Embers-of-the-Eternal-Abyss-Releases';

function formatDate(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function formatSize(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

async function loadLatestRelease() {
    const labels = document.querySelectorAll('[data-latest-label]');
    try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
        if (res.status === 404) {
            labels.forEach(el => el.textContent = '即將推出');
            return;
        }
        if (!res.ok) throw new Error(res.status);
        const release = await res.json();
        labels.forEach(el => el.textContent = `最新版本 ${release.tag_name}（${formatDate(release.published_at)}）`);

        // .apk 給 Android；.exe 或 .zip 給 Windows
        const patterns = { apk: /\.apk$/i, exe: /\.(exe|zip)$/i };
        document.querySelectorAll('[data-download]').forEach(btn => {
            const asset = release.assets.find(a => patterns[btn.dataset.download].test(a.name));
            if (asset) {
                btn.href = asset.browser_download_url;
                btn.textContent = `下載 ${release.tag_name}（${formatSize(asset.size)}）`;
            }
        });
    } catch (e) {
        labels.forEach(el => el.textContent = '');
    }
}

// 捲動後導覽列加深
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) nav.classList.toggle('bg-abyss-950/95', window.scrollY > 50);
});

loadLatestRelease();
