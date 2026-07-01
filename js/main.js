// ====================const API_BASE = 'http://xiwangwu.pythonanywhere.com';
const API_BASE = 'https://ancient-bread-5e4a.1684044670.workers.dev';
// ==================== 1. 滚动渐显动画（保留） ====================
const fadeElements = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });
fadeElements.forEach(el => observer.observe(el));

// ==================== 2. 回到顶部按钮（保留） ====================
const backTop = document.getElementById('backTop');
if (backTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backTop.classList.add('show');
        } else {
            backTop.classList.remove('show');
        }
    });
    backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 非遗分类筛选（静态页面专用）
const filterBtns = document.querySelectorAll('.filter-btn');
const cardList = document.querySelectorAll('.heritage-card');

filterBtns.forEach(btn => {
  btn.onclick = function () {
    // 切换选中样式
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');

    // 获取当前选中分类
    let type = this.dataset.type;

    // 遍历卡片，控制显示隐藏
    cardList.forEach(card => {
      if (type === 'all' || card.dataset.category === type) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
});
// ==================== 4. 节日数据动态加载 ====================
async function loadFestivals() {
    const container = document.getElementById('festival-container');
    if (!container) return;
    container.innerHTML = '<p>加载中...</p>';
    try {
        const res = await fetch(`${API_BASE}/api/festivals`);
        if (!res.ok) throw new Error('请求失败');
        const festivals = await res.json();
        container.innerHTML = festivals.map(f => `
            <div class="festival-item fade-in" style="display:flex; gap:20px; margin-bottom:20px;">
                <img src="${f.image_url || '../images/placeholder.jpg'}" alt="${f.name}" style="width:200px; height:150px; object-fit:cover; border-radius:8px;">
                <div>
                    <h3>${f.name} <small>${f.date_info || ''}</small></h3>
                    <p><strong>由来：</strong>${f.origin || ''}</p>
                    <p><strong>习俗：</strong>${f.customs || ''}</p>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    } catch (err) {
        container.innerHTML = '<p>加载失败</p>';
        console.error(err);
    }
}

if (document.getElementById('festival-container')) {
    loadFestivals();
}

// ==================== 5. 答题判分系统（暂时保留静态版本） ====================
const answerKey = { q1: 'B', q2: 'A', q3: 'C', q4: 'A' };
const submitQuiz = document.getElementById('submitQuiz');
if (submitQuiz) {
    submitQuiz.addEventListener('click', () => {
        let score = 0;
        for (let key in answerKey) {
            const selected = document.querySelector(`input[name="${key}"]:checked`);
            if (selected && selected.value === answerKey[key]) {
                score++;
                selected.parentElement.style.background = '#e8f5e9';
                selected.parentElement.style.borderColor = '#2e7d32';
            } else if (selected) {
                selected.parentElement.style.background = '#ffebee';
                selected.parentElement.style.borderColor = '#c62828';
            }
        }
        document.getElementById('scoreNum').textContent = score;
        const resultTip = document.getElementById('resultTip');
        if (score === 4) resultTip.textContent = '太棒了！你是传统文化小达人~';
        else if (score >= 2) resultTip.textContent = '不错哦，继续加油学习！';
        else resultTip.textContent = '再接再厉，多了解传统文化知识吧~';
        document.getElementById('quizResult').style.display = 'block';
    });
}

// ==================== 6. 留言板（后端版，替换原 localStorage） ====================
async function loadMessages() {
    const msgList = document.getElementById('msgList');
    if (!msgList) return;
    try {
        const res = await fetch(`${API_BASE}/api/messages`);
        if (!res.ok) throw new Error('加载失败');
        const messages = await res.json();
        if (messages.length === 0) {
            msgList.innerHTML = '<p style="color:#999;">暂无留言，快来抢沙发吧~</p>';
            return;
        }
        msgList.innerHTML = messages.map(msg => `
            <div style="padding:1rem; border-bottom:1px dashed var(--light-gray); margin-bottom:0.5rem;">
                <strong>${msg.username || '匿名'}</strong>
                <span style="font-size:0.8rem; color:#999;">${new Date(msg.created_at).toLocaleString('zh-CN')}</span>
                <p>${msg.content}</p>
            </div>
        `).join('');
    } catch (err) {
        msgList.innerHTML = '<p style="color:red;">留言加载失败</p>';
        console.error(err);
    }
}

const submitMsg = document.getElementById('submitMsg');
if (submitMsg) {
    // 先加载已有留言
    loadMessages();

    submitMsg.addEventListener('click', async () => {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();
        if (!content) return alert('请输入留言内容~');

        const token = localStorage.getItem('token');
        if (!token) {
            alert('请先登录再留言');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || '发送失败');
                return;
            }
            input.value = '';
            loadMessages();
        } catch (err) {
            alert('网络错误，请稍后再试');
        }
    });
}

// ==================== 7. 每日知识随机切换（保留） ====================
const dailyTip = document.getElementById('dailyTip');
if (dailyTip) {
    const tips = [
        '「文房四宝」指的是笔、墨、纸、砚，其中湖笔、徽墨、宣纸、端砚最为知名。',
        '二十四节气是中国古代订立的指导农事的补充历法，2016年列入人类非物质文化遗产。',
        '中国四大发明分别是造纸术、指南针、火药、活字印刷术，对世界文明影响深远。',
        '十二生肖又叫属相，依次为鼠、牛、虎、兔、龙、蛇、马、羊、猴、鸡、狗、猪。',
        '汉服全称是"汉民族传统服饰"，始于黄帝，备于尧舜，各朝代形制各有特色。'
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    dailyTip.querySelector('p').textContent = randomTip;
}

// ==================== 8. 登录/注册弹窗 ====================
const loginMask = document.getElementById('loginMask');
const openLoginBtn = document.getElementById('openLogin');
const closeLoginBtn = document.getElementById('closeLogin');
const loginForm = document.getElementById('loginForm');
const regForm = document.getElementById('regForm');
const tabs = document.querySelectorAll('.tab-box .tab');
let currentMode = 'login';

// 点击关闭按钮
if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', () => {
        loginMask.classList.remove('show');
    });
}

// 点击遮罩关闭
loginMask?.addEventListener('click', (e) => {
    if (e.target === loginMask) loginMask.classList.remove('show');
});

// 切换登录/注册标签
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const type = tab.dataset.type;
        if (type === 'login') {
            currentMode = 'login';
            loginForm.classList.remove('hide');
            regForm.classList.remove('show');
        } else {
            currentMode = 'reg';
            loginForm.classList.add('hide');
            regForm.classList.add('show');
        }
    });
});

// 登录表单提交
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginForm.querySelector('input[name="username"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value.trim();
    if (!username || !password) return;
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.user.username);
            loginMask.classList.remove('show');
            updateLoginStatus();
        } else {
            alert(data.error || '登录失败');
        }
    } catch (err) {
        alert('网络错误，请确认后端已启动');
    }
});

// 注册表单提交
regForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = regForm.querySelector('input[name="username"]').value.trim();
    const password = regForm.querySelector('input[name="password"]').value.trim();
    if (!username || !password) return;
    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            alert('注册成功，请登录');
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelector('.tab[data-type="login"]').classList.add('active');
            loginForm.classList.remove('hide');
            regForm.classList.remove('show');
            currentMode = 'login';
        } else {
            alert(data.error || '注册失败');
        }
    } catch (err) {
        alert('网络错误，请确认后端已启动');
    }
});

// 更新登录状态 + 退出功能
function updateLoginStatus() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (openLoginBtn) {
        if (token && username) {
            openLoginBtn.textContent = `👤 ${username}`;
            openLoginBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm('确定要退出登录吗？')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    openLoginBtn.textContent = '登录 / 注册';
                    updateLoginStatus();
                }
            };
        } else {
            openLoginBtn.textContent = '登录 / 注册';
            openLoginBtn.onclick = (e) => {
                e.preventDefault();
                if (loginMask) {
                    loginMask.classList.add('show');
                }
            };
        }
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', updateLoginStatus);
// 1. 滚动导航栏变色
const navBar = document.querySelector('.navbar');
window.addEventListener('scroll', function () {
  if (window.scrollY > 60) {
    navBar.style.background = "rgba(255,252,245,0.96)";
    navBar.style.boxShadow = "0 2px 12px rgba(120,90,40,0.12)";
  } else {
    navBar.style.background = "transparent";
    navBar.style.boxShadow = "none";
  }
});

// 2. 滚动元素渐入
const fadeList = document.querySelectorAll('.fade-in');
function checkFade() {
  fadeList.forEach(item => {
    let rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.82) {
      item.classList.add('show');
    }
  })
}
window.addEventListener('scroll', checkFade);
window.addEventListener('load', checkFade);

// 3. 回到顶部淡显
const backTopBtn = document.getElementById('backTop');
window.addEventListener('scroll', function () {
  if (window.scrollY > 300) {
    backTopBtn.classList.add('show');
  } else {
    backTopBtn.classList.remove('show');
  }
});
backTopBtn.onclick = function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 4. 一键复制文本功能（全局通用）
function copyText(txt) {
  navigator.clipboard.writeText(txt);
  alert("文案复制成功，可以直接粘贴到作业里！");
}

// 5. 图片灯箱大图预览
document.querySelectorAll('img').forEach(img => {
  img.onclick = function () {
    let bigImg = new Image();
    bigImg.src = this.src;
    let layer = document.createElement('div');
    layer.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.85);display:flex;justify-content:center;
      align-items:center;z-index:9999;cursor:zoom-out;
    `;
    bigImg.style.maxWidth = "90%";
    bigImg.style.maxHeight = "90%";
    layer.appendChild(bigImg);
    document.body.appendChild(layer);
    layer.onclick = ()=> layer.remove();
  }
});

// 首页轮播自动切换
let index = 0;
let timer;
const box = document.querySelector('.banner-box');
const list = document.querySelector('.banner-list');
const dots = document.querySelectorAll('.dot');
const itemWidth = document.querySelector('.banner-item').offsetWidth;

function autoPlay() {
    index++;
    if(index >= 2) index = 0;
    update();
}
function update() {
    list.style.transform = `translateX(-${index * itemWidth}px)`;
    dots.forEach((d,i)=> d.classList.toggle('active', i===index));
}

// 3秒自动切换
timer = setInterval(autoPlay, 3000);
// 鼠标悬停暂停
box.onmouseover = ()=> clearInterval(timer);
box.onmouseout = ()=> timer = setInterval(autoPlay,3000);

// 左右箭头点击
document.querySelector('.prev').onclick = ()=>{
    index--;
    if(index < 0) index = 1;
    update();
}
document.querySelector('.next').onclick = ()=>{
    index++;
    if(index >= 3) index = 0;
    update();
}
// 小圆点点击
dots.forEach((dot,i)=>{
    dot.onclick = ()=>{
        index = i;
        update();
    }
})