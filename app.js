document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 0. Database / API Configuration
    // ==========================================================================
    // 구글 스프레드시트 연동용 Apps Script Web App URL 설정
    // 배포한 Apps Script URL이 있다면 아래 공란에 'https://script.google.com/...' 형태로 입력해 두시면 됩니다.
    const GOOGLE_SCRIPT_URL = localStorage.getItem('bbc_google_script_url') || 'https://script.google.com/macros/s/AKfycbxpjZFW6PskaC_EezLOp6NQLMeECpCrLsh5meBdTDfRC-sc0orb7U5thdCqRxGPk56a/exec';

    // ==========================================================================
    // 1. Theme Toggle (Dark / Light Mode)
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Helper to update logo image source based on active theme with cache busting
    const updateLogoForTheme = (theme) => {
        const logoImages = document.querySelectorAll('.logo-img');
        const cacheBuster = Date.now();
        logoImages.forEach(img => {
            if (theme === 'light') {
                img.src = `assets/logo_light.png?v=${cacheBuster}`;
            } else {
                img.src = `assets/logo_dark.png?v=${cacheBuster}`;
            }
        });
    };

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        updateLogoForTheme('light');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        updateLogoForTheme('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            updateLogoForTheme('light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            updateLogoForTheme('dark');
        }
    });

    // ==========================================================================
    // 2. Mobile Nav Menu Toggle
    // ==========================================================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navItems = document.querySelectorAll('.nav-item');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Header scroll background padding change
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '5px 0';
            header.querySelector('.header-container').style.height = '70px';
        } else {
            header.style.padding = '0';
            header.querySelector('.header-container').style.height = '90px';
        }
    });

    // ==========================================================================
    // 3. LocalStorage Database Setup for Book Club
    // ==========================================================================
    const defaultSchedule = [
        { week: 1, date: "8/27", id: "storm_coming", book: "폭풍이 온다", publisher: "21세기북스", author: "오드 아르네 베스타 (Odd Arne Westad)", lecturer: "이동우", cover: "assets/storm_coming.jpg" },
        { week: 2, date: "9/3", id: "super_abundance", book: "초풍요의 시대", publisher: "비즈니스북스", author: "피터 디아만디스, 스티븐 코틀러", lecturer: "이동우", cover: "assets/super_abundance.jpg" },
        { week: 3, date: "9/10", id: "pseudo_labor", book: "가짜 노동", publisher: "자음과모음", author: "데니스 뇌르마르크, 아네르스 포그 옌센", lecturer: "장유신", cover: "assets/pseudo_labor.jpg" },
        { week: 4, date: "9/17", id: "think_like_giant", book: "거인처럼 생각하라", publisher: "비즈니스북스", author: "피터 홀린스", lecturer: "조민호", cover: "assets/think_like_giant.jpg" },
        { week: 5, date: "10/1", id: "doom_loop", book: "둠루프", publisher: "21세기북스", author: "에스와르 S. 프라사드", lecturer: "김광석", cover: "assets/doom_loop.jpg" },
        { week: 6, date: "10/8", id: "great_managing", book: "위대한 경영의 12가지 조건", publisher: "청림출판", author: "갤럽, 짐 하터", lecturer: "이동우", cover: "assets/great_managing.jpg" },
        { week: 7, date: "10/15", id: "quantum_recipe", book: "양자컴퓨터 레시피", publisher: "세종서적", author: "김용수 외", lecturer: "김용수", cover: "assets/quantum_recipe.jpg" },
        { week: 8, date: "10/22", id: "endure_mind", book: "끝까지 해내는 마음은 어떻게 탄생하는가", publisher: "현대지성", author: "웬디 그롤닉, 벤저민 헤디, 프랭크 워렐", lecturer: "이동우", cover: "assets/endure_mind.jpg" },
        { week: 9, date: "10/29", id: "dual_brain", book: "듀얼 브레인", publisher: "상상스퀘어", author: "이선 몰릭", lecturer: "김건우", cover: "assets/dual_brain.jpg" },
        { week: 10, date: "11/5", id: "tech_illusion", book: "기술이 인류를 구원한다는 착각", publisher: "동아시아", author: "애덤 베커", lecturer: "이동우", cover: "assets/tech_illusion.jpg" }
    ];

    const defaultColumns = [
        { 
            id: 1, 
            title: "흐름의 법칙과 멀티태스킹의 함정", 
            author: "이동우 북멘토", 
            summary: "지식노동과 복합 프로젝트 환경에서 생산성을 갉아먹는 진짜 범인은 무엇인지 처방합니다.", 
            date: "2026.07.02",
            content: "현대 비즈니스 환경에서 실무자들은 여러 태스크를 동시에 처리하는 멀티태스킹을 찬양하지만, 이는 지식 노동 생산성을 획기적으로 낮추는 주범입니다. 엘리 골드렛의 흐름의 법칙에 따르면 전체 시스템의 성과는 리소스 효율성(개인이 계속 바쁜 것)이 아닌 흐름 효율성(업무가 지체 없이 흘러가는 것)에 달려 있습니다. 한 가지 핵심 문제에 집중하여 빠르게 마무리 짓는 시스템을 설계하는 법을 공유합니다."
        },
        { 
            id: 2, 
            title: "인공지능의 정렬 문제와 인간의 종말", 
            author: "김건우 교수", 
            summary: "실리콘밸리의 석학 엘리에저 유드코스키가 경고하는 초지능 정렬 문제와 비즈니스 함의.", 
            date: "2026.06.25",
            content: "인류가 만들어 낸 인공지능이 인간의 제어 범위를 벗어나는 시점, 즉 초지능의 탄생에 대해 유드코스키는 차갑고 경고조의 메시지를 던집니다. AI의 목표를 인류의 복지와 일치시키는 '정렬 문제(Alignment Problem)'가 선제 해결되지 않는다면 혁신 기술은 재앙이 될 수 있습니다. 우리 비즈니스 리더들이 AX(AI 전환)를 외칠 때, 윤리적 기준과 통제 설계를 왜 1순위로 두어야 하는지 다룹니다."
        },
        { 
            id: 3, 
            title: "양자 컴퓨터 기술이 유발할 산업 패러다임 시프트", 
            author: "김용수 단장", 
            summary: "양자 비트 연산이 미래 핀테크, 물류, 제약 분야의 전략적 판도를 어떻게 바꿀지 분석합니다.", 
            date: "2026.06.18",
            content: "슈퍼컴퓨터로 수만 년 걸릴 연산을 수분 만에 해치우는 양자 컴퓨터는 공상과학이 아닌 현실의 영역으로 다가오고 있습니다. 암호학의 붕괴, 신약 및 신소재 스크리닝 가속화, 금융 포트폴리오 최적화 등 거의 모든 고가치 산업이 양자 기술 아래 재정렬될 예정입니다. 리더들이 지금부터 양자 기술 인프라를 이해하고 투자 방향을 조율해야 하는 이유를 설명합니다."
        }
    ];

    // Initialize mock database
    const DB_VERSION = 'v2.6';
    if (localStorage.getItem('bbc_db_version') !== DB_VERSION) {
        localStorage.setItem('bbc_schedule', JSON.stringify(defaultSchedule));
        localStorage.setItem('bbc_columns', JSON.stringify(defaultColumns));
        localStorage.setItem('bbc_db_version', DB_VERSION);
    }
    if (!localStorage.getItem('bbc_waitlist')) {
        localStorage.setItem('bbc_waitlist', JSON.stringify([]));
    }
    if (!localStorage.getItem('bbc_summaries')) {
        localStorage.setItem('bbc_summaries', JSON.stringify({}));
    }

    // ==========================================================================
    // 4. Dynamic Renderer (Schedule & Columns & Hero cover)
    // ==========================================================================
    const renderWaitlistTable = (list, isGoogleSheet = false) => {
        const waitlistBody = document.getElementById('admin-waitlist-body');
        if (!waitlistBody) return;
        
        waitlistBody.innerHTML = '';
        if (list.length === 0) {
            waitlistBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">등록된 신청 대기자가 아직 없습니다.${isGoogleSheet ? ' (구글 시트 연동됨)' : ''}</td></tr>`;
            return;
        }
        
        list.forEach(app => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${app.name}</strong></td>
                <td>${app.phone}</td>
                <td>${app.email}</td>
                <td>${app.company} (${app.role})</td>
                <td><span class="badge" style="margin:0; background: ${isGoogleSheet ? '#107c41' : 'var(--accent-gold)'}; color: #fff;">${app.plan}${isGoogleSheet ? ' (시트)' : ''}</span></td>
                <td>${app.timestamp}</td>
            `;
            waitlistBody.appendChild(tr);
        });
    };

    const fetchGoogleWaitlist = () => {
        if (!GOOGLE_SCRIPT_URL) return;
        
        const waitlistBody = document.getElementById('admin-waitlist-body');
        if (waitlistBody) {
            waitlistBody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: var(--accent-gold);"><span class="spinner" style="display:inline-block; margin-right:8px; animation: spin 1.2s linear infinite;">🔄</span> 구글 스프레드시트에서 실시간 목록을 가져오는 중...</td></tr>`;
        }
        
        fetch(`${GOOGLE_SCRIPT_URL}?action=get_waitlist`)
            .then(res => res.json())
            .then(json => {
                if (json.result === 'success' && json.data) {
                    renderWaitlistTable(json.data, true);
                } else {
                    console.warn("Failed to get waitlist data from Google Apps Script:", json.message);
                    const waitlist = JSON.parse(localStorage.getItem('bbc_waitlist')) || [];
                    renderWaitlistTable(waitlist, false);
                }
            })
            .catch(err => {
                console.error("Google Sheets fetch error:", err);
                const waitlist = JSON.parse(localStorage.getItem('bbc_waitlist')) || [];
                renderWaitlistTable(waitlist, false);
            });
    };

    const renderPageData = () => {
        const schedule = JSON.parse(localStorage.getItem('bbc_schedule'));
        const columns = JSON.parse(localStorage.getItem('bbc_columns'));
        const waitlist = JSON.parse(localStorage.getItem('bbc_waitlist'));

        // Render Schedule Table
        const tableBody = document.getElementById('schedule-table-body');
        if (tableBody) {
            tableBody.innerHTML = '';
            schedule.forEach(item => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-id', item.id);
                
                tr.innerHTML = `
                    <td class="table-week-num">${item.week}회차</td>
                    <td class="table-date">${item.date}</td>
                    <td>
                        <div class="table-book-title-cell">
                            <img src="${item.cover}" alt="${item.book} 표지" class="table-book-thumb" onerror="this.src='assets/zero_to_one_cover.jpg'">
                            <span>${item.book}</span>
                        </div>
                    </td>
                    <td>${item.publisher}</td>
                    <td>${item.author}</td>
                    <td class="table-lecturer">${item.lecturer}</td>
                    <td><button class="table-summary-btn" data-id="${item.id}">발제 요약</button></td>
                `;
                
                // Add click event for details modal (clicking tr or button opens detail)
                tr.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'BUTTON') {
                        openBookDetail(item.id);
                    }
                });
                
                tableBody.appendChild(tr);
            });

            // Register summary button clicks
            document.querySelectorAll('.table-summary-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const bookId = btn.getAttribute('data-id');
                    openBookDetail(bookId);
                });
            });
        }

        // Populate Cover week select dropdown dynamically
        const coverSelect = document.getElementById('cover-week-select');
        if (coverSelect) {
            const currentVal = coverSelect.value;
            coverSelect.innerHTML = '';
            schedule.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.week;
                opt.textContent = `${item.week}회차 (${item.book.substring(0, 15)})`;
                coverSelect.appendChild(opt);
            });
            if (currentVal) coverSelect.value = currentVal;
        }

        // Render Columns
        const columnsContainer = document.getElementById('columns-grid-container');
        if (columnsContainer) {
            columnsContainer.innerHTML = '';
            columns.forEach(col => {
                const card = document.createElement('div');
                card.className = 'column-card glass-panel';
                card.innerHTML = `
                    <div class="column-meta">작성자: ${col.author} | 게재일: ${col.date}</div>
                    <h3>${col.title}</h3>
                    <p>${col.summary}</p>
                    <div class="column-read-btn" data-id="${col.id}">전체 칼럼 읽기</div>
                `;
                columnsContainer.appendChild(card);
            });

            // Column read button click
            document.querySelectorAll('.column-read-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const colId = parseInt(btn.getAttribute('data-id'), 10);
                    const selectedCol = columns.find(c => c.id === colId);
                    if (selectedCol) {
                        showColumnModal(selectedCol);
                    }
                });
            });
        }

        // Render Admin Waitlist (local storage fallback initially)
        renderWaitlistTable(waitlist, false);

        // Update Hero Cover to specific book (초풍요의 시대)
        const heroCover = document.getElementById('hero-book-cover');
        if (heroCover && schedule[1]) {
            heroCover.src = schedule[1].cover;
        }
    };

    // ==========================================================================
    // 5. Book Summaries Database
    // ==========================================================================
    const summariesDb = {
        'storm_coming': {
            title: '폭풍이 온다',
            subtitle: '오드 아르네 베스타 저 | 21세기북스 | 강연: 이동우',
            content: `
                <h4>1. 세계사적 대전환기와 비즈니스의 지정학적 위기</h4>
                <p>세계적인 역사학자이자 패권 분석의 권위자인 오드 아르네 베스타가 집필한 책으로, 인류 역사상 제국들의 격돌과 지정학적 대격변이 현대 글로벌 경제와 비즈니스 지형에 주는 거대한 메시지를 담고 있습니다.</p>
                
                <h4>2. 패권 전쟁과 경제적 충격의 역사적 교훈</h4>
                <p>미국과 중국의 갈등, 그리고 우크라이나 및 중동 분쟁 등 현대의 지정학적 리스크는 과거 19세기 및 20세기 초의 패권 다툼 양상과 매우 흡사합니다. 역사의 패턴 속에서 기업이 살아남기 공급망 설계와 비즈니스 포지셔닝을 진단합니다.</p>
                
                <h4>3. 불확실성 시대의 리더십과 시나리오 경영</h4>
                <p>최고의 리더들은 맑은 날에 폭풍을 대비합니다. 역사적 폭풍 속에서 무너졌던 조직과 강인하게 살아남았던 비즈니스의 사유 체계를 통해, 현대 리더들이 수립해야 할 다차원적 전략 로드맵을 심층적으로 논의합니다.</p>
            `
        },
        'super_abundance': {
            title: '초풍요의 시대',
            subtitle: '피터 디아만디스, 스티븐 코틀러 저 | 비즈니스북스 | 강연: 이동우',
            content: `
                <h4>1. 기술의 기하급수적 성장과 풍요의 로드맵</h4>
                <p>싱듈래리티 대학교의 창립자 피터 디아만디스가 말하는 인류 문명의 위기 돌파구입니다. 에너지가 고갈되고 인구가 줄어드는 위기 속에서도, 기술의 폭발적 성장은 자원의 가치를 기하급수적으로 낮추어 역사상 유례없는 '초풍요'를 선사할 것임을 과학적 통계로 입증합니다.</p>
                
                <h4>2. AI, 센서, 네트워크가 이끄는 융합적 미래 비즈니스</h4>
                <p>인공지능, 메타버스, 유전공학, 청정에너지가 서로를 촉진하며 융합하여 기하급수적 성장의 원동력이 됩니다. 이 세션에서는 리더가 맞이해야 할 차세대 비즈니스의 융합 시너지 설계 원칙을 학습합니다.</p>
                
                <h4>3. 결핍의 마인드셋에서 초풍요의 전략으로 전환</h4>
                <p>자원의 희소성과 한계를 극복하려는 투쟁에서 벗어나, 기술이 주는 풍요를 기반으로 새로운 기회를 포착하는 '풍요 마인드셋'을 획득하고, 현업 비즈니스의 액션 플랜을 새롭게 포뮬러화합니다.</p>
            `
        },
        'pseudo_labor': {
            title: '가짜 노동 (스스로 만드는 번아웃의 세계)',
            subtitle: '데니스 뇌르마르크, 아네르스 포그 옌센 저 | 자음과모음 | 강연: 장유신 전무',
            content: `
                <h4>1. 우리는 왜 아무리 일해도 시간이 부족할까?</h4>
                <p>분명 기술과 기계화는 발달하는데, 현대 직장인들은 여전히 장시간 노동과 번아웃에 시달립니다. 저자들은 직장 내부에서 실질적인 비즈니스 성과와는 하등 상관없는 보고서 작성, 무의미한 회의, 생존을 위한 '바쁜 척하기' 등에 막대한 시간이 소모되고 있다고 꼬집습니다.</p>
                
                <h4>2. 가짜 노동 (Pseudo Work)의 분류</h4>
                <p>조직이 거대화될수록 스스로를 유지하기 위해 불필요한 관료주의와 가짜 노동이 자연 증식합니다. 이 세션에서는 우리의 부서와 일상 속에 조용히 스며든 '가짜 업무'들을 찾아내 도려내는 구체적인 조직 혁신 프레임워크를 나눕니다.</p>
            `
        },
        'think_like_giant': {
            title: '거인처럼 생각하라',
            subtitle: '피터 홀린스 저 | 비즈니스북스 | 강연: 조민호 대표',
            content: `
                <h4>1. 프레임의 확장, 한계의 돌파</h4>
                <p>최고의 리더들은 일반 실무자들과 다르게 사유합니다. 피터 홀린스는 인지 심리학을 기반으로 전 세계 역사와 비즈니스에서 압도적인 발자취를 남긴 '거인'들의 사고 작동 원리(Mental Model)를 과학적으로 파헤칩니다.</p>
                
                <h4>2. 인지적 편향 극복과 의사 결정의 공식</h4>
                <p>불확실한 시장 상황에서 인간 본능이 초래하는 의사결정 편향을 어떻게 걷어내고, 장기적인 성공 확률이 극도로 높은 선택만을 걸러낼 수 있는지 그 멘탈 프레임을 세션 참가자의 경영 이슈에 직접 대입하여 코칭합니다.</p>
            `
        },
        'addiction_design': {
            title: '중독의 설계',
            subtitle: '나타샤 다우 쉴 저 | 한국문화사 | 강연: 이동우',
            content: `
                <h4>1. 현대 플랫폼 기업들이 소비자를 붙잡아두는 비결</h4>
                <p>인스타그램, 틱톡, 넷플릭스 등 성공한 디지털 비즈니스는 본질적으로 사용자의 뇌 과학적 중독 기전을 자극하도록 설계(Addiction Loop)되어 있습니다. 행동 중독의 역사와 카지노 머신, 소셜 미디어 알고리즘의 결합 구조를 상세히 파헤칩니다.</p>
                
                <h4>2. 가치와 윤리 사이의 비즈니스 퍼널</h4>
                <p>소비자의 자발적 중독(지속성)을 만들어내는 매력적인 가치 사다리를 설계함과 동시에, 리더로서 비즈니스의 사회적 책무와 윈윈 모델을 어떻게 지켜낼 것인지 심층 토론을 진행합니다.</p>
            `
        },
        'great_managing': {
            title: '위대한 경영의 12가지 조건',
            subtitle: '갤럽, 짐 하터 저 | 청림출판 | 강연: 이동우',
            content: `
                <h4>1. 기업 성장은 몰입하는 직원에서 나온다</h4>
                <p>갤럽이 40년간 1,200만 명의 직원을 대상으로 축적한 방대한 데이터 분석을 바탕으로, 높은 생산성과 탁월한 성과를 창출하는 조직의 핵심 동력인 '직원 몰입도(Employee Engagement)'의 비밀을 파헤칩니다.</p>
                
                <h4>2. 지속 성장하는 조직을 만드는 12가지 성과 지표</h4>
                <p>명확한 역할 기대, 적절한 포상과 인정, 성장과 발전을 돕는 피드백 시스템 등 리더가 당장 실천에 옮길 수 있는 12가지 자율 경영 조건을 비즈니스 현장에 대입하여 전략을 수립합니다.</p>
            `
        },
        'dual_brain': {
            title: '듀얼 브레인',
            subtitle: '이선 몰릭(Ethan Mollick) 저 | 상상스퀘어 | 강연: 김건우 교수',
            content: `
                <h4>1. AI를 든 인간이 지배하는 비즈니스 생태계</h4>
                <p>생성형 AI 시대에 AI를 단순한 정보 도구(Tool)가 아닌, 비즈니스 성장을 함께 견인하는 공동 지능(Co-Intelligence)의 파트너이자 동료(Co-worker)로 정의하고 이를 조직과 비즈니스에 밀결합하는 최고의 생존 방식을 논합니다.</p>
                
                <h4>2. 켄타우로스와 사이보그: 실전 AI 협업 모델</h4>
                <p>사용자와 AI의 명확한 역할 분담을 통한 켄타우로스 방식, 그리고 경계 없이 융합하여 상호 보완하는 사이보그 방식의 비즈니스 퍼널 적용 사례를 KT AX컨설턴트 김건우 교수의 통찰 깊은 눈으로 들여다봅니다.</p>
            `
        },
        'quantum_recipe': {
            title: '양자컴퓨터 레시피',
            subtitle: '김용수 외 저 | 세종서적 | 강연: 김용수 단장',
            content: `
                <h4>1. 큐비트(Qubit)가 여는 미래의 열쇠</h4>
                <p>양자 얽힘과 중첩의 물리 원리를 이용하여 현존하는 디지털 컴퓨터의 한계를 조 단위로 넘어서는 차세대 컴퓨팅 혁명입니다. KIST 양자기술연구단장이 대중의 눈높이에 맞춰 기술적 장벽을 허물어 드립니다.</p>
                
                <h4>2. 양자 컴퓨팅의 주요 실전 분야</h4>
                <p>보안/암호 시스템의 변혁, 화학 분자 시뮬레이션을 통한 배터리 및 신약 혁신, 복잡한 운송/물류 네트워크의 경로 최적화 등 10년 내에 비즈니스 지도를 영구히 바꿀 주요 기술적 기회를 탐색합니다.</p>
            `
        },
        'endure_mind': {
            title: '끝까지 해내는 마음은 어떻게 탄생하는가',
            subtitle: '웬디 그롤닉, 벤저민 헤디, 프랭크 워렐 저 | 현대지성 | 강연: 이동우',
            content: `
                <h4>1. 외재적 동기와 보상의 역효과</h4>
                <p>성과금, 칭찬, 채찍과 같은 외적 인센티브가 오히려 구성원들의 내재적 열망과 창의성을 억누르고 조직 성과를 저해한다는 최신 심리학적 근거를 설명합니다.</p>
                
                <h4>2. 자기결정성 이론 (Self-Determination Theory)</h4>
                <p>인간이 스스로 열정을 불태워 끝까지 해내게 만드는 3대 심리 욕구인 <strong>'유능성, 자율성, 관계성'</strong>을 조직 문화와 개인의 일상에 어떻게 안전하게 이식할 수 있을지 배웁니다. 리더십의 근본 패러다임을 혁신합니다.</p>
            `
        },
        'doom_loop': {
            title: '둠루프',
            subtitle: '에스와르 S. 프라사드 저 | 21세기북스 | 강연: 김광석 실장',
            content: `
                <h4>1. 경제, 정치, 지정학이 충돌하는 파멸의 고리</h4>
                <p>미중 갈등, 지정학적 대분열, 자국 우선주의 정책이 얽히고설켜 세계 경제 질서를 어떻게 위기로 몰고 가는지 분석합니다. 패권 경쟁의 소용돌이 속에서 세계 질서가 무너져 가는 거대한 '둠루프(Doom Loop)' 기전을 상세히 들여다봅니다.</p>
                
                <h4>2. 대격변의 시대, 대한민국 비즈니스의 탈출구</h4>
                <p>정치적 갈등이 경제적 충돌로 비화되는 초불확실성 시대 속에서, 기업 리더들이 리스크를 분산하고 지속 가능한 비즈니스 모델을 유지하기 위해 당장 실행해야 할 생존 전략과 대응 시나리오를 공유합니다.</p>
            `
        },
        'tech_illusion': {
            title: '기술이 인류를 구원한다는 착각',
            subtitle: '애덤 베커 저 | 동아시아 | 강연: 이동우',
            content: `
                <h4>1. 테크노-유토피아와 실리콘밸리 만능주의</h4>
                <p>실리콘밸리의 기술 만능주의(Techno-optimism)와 초거대 기술 기업의 오너들이 주장하는 인류 구원의 담론 이면에 도사리고 있는 위험성을 진단합니다. 기후위기, 민주주의의 위협, 부의 격차를 단순히 '새로운 코드와 앱'이 극복할 수 없다는 비판적 지각을 제공합니다.</p>
                
                <h4>2. 리더의 인문학적 성찰</h4>
                <p>우리는 비즈니스를 영위하면서 사회적 임팩트를 어떻게 조율할 것인가? 기술을 건강한 도구로 부리면서 사람의 얼굴을 한 경영 철학을 지킬 수 있는 깊이 있는 인문학적 결말을 제공합니다.</p>
            `
        }
    };

    // ==========================================================================
    // 6. Modal Openers & Closers
    // ==========================================================================
    const applyModal = document.getElementById('apply-modal');
    const successModal = document.getElementById('success-modal');
    const summaryModal = document.getElementById('summary-modal');
    const termsModal = document.getElementById('terms-modal');
    const privacyModal = document.getElementById('privacy-modal');

    const modalCloseBtn = document.getElementById('modal-close');
    const successCloseBtn = document.getElementById('success-close-btn');
    const summaryCloseBtn = document.getElementById('summary-close');
    const termsCloseBtn = document.getElementById('terms-close');
    const termsConfirmBtn = document.getElementById('terms-confirm-btn');
    const openTermsBtn = document.getElementById('open-terms-btn');
    const privacyCloseBtn = document.getElementById('privacy-close');
    const privacyConfirmBtn = document.getElementById('privacy-confirm-btn');
    const openPrivacyBtn = document.getElementById('open-privacy-btn');

    const openModal = (modal) => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => closeModal(applyModal));
    if (successCloseBtn) successCloseBtn.addEventListener('click', () => closeModal(successModal));
    if (summaryCloseBtn) summaryCloseBtn.addEventListener('click', () => closeModal(summaryModal));
    if (termsCloseBtn) termsCloseBtn.addEventListener('click', () => closeModal(termsModal));
    if (termsConfirmBtn) termsConfirmBtn.addEventListener('click', () => closeModal(termsModal));
    if (privacyCloseBtn) privacyCloseBtn.addEventListener('click', () => closeModal(privacyModal));
    if (privacyConfirmBtn) privacyConfirmBtn.addEventListener('click', () => closeModal(privacyModal));

    if (openTermsBtn && termsModal) {
        openTermsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(termsModal);
        });
    }

    if (openPrivacyBtn && privacyModal) {
        openPrivacyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(privacyModal);
        });
    }

    // Close modal on window background click
    window.addEventListener('click', (e) => {
        if (e.target === applyModal) closeModal(applyModal);
        if (e.target === successModal) closeModal(successModal);
        if (e.target === summaryModal) closeModal(summaryModal);
        if (e.target === termsModal) closeModal(termsModal);
        if (e.target === privacyModal) closeModal(privacyModal);
        
        // Hide column details modal if open
        const colModal = document.getElementById('column-detail-modal');
        if (e.target === colModal) {
            colModal.remove();
            document.body.style.overflow = '';
        }
    });

    // Event Trigger Buttons mapping
    const triggerButtons = [
        { el: document.getElementById('nav-apply-btn'), plan: null },
        { el: document.getElementById('hero-apply-btn'), plan: null },
        { el: document.getElementById('apply-monthly-btn'), plan: 'Monthly' },
        { el: document.getElementById('apply-yearly-btn'), plan: 'Yearly' }
    ];

    triggerButtons.forEach(btnObj => {
        if (btnObj.el) {
            btnObj.el.addEventListener('click', (e) => {
                e.preventDefault();
                const select = document.getElementById('membership-select');
                if (btnObj.plan) {
                    select.value = btnObj.plan;
                } else {
                    select.selectedIndex = 0;
                }
                openModal(applyModal);
            });
        }
    });

    // Open Book details modal
    const openBookDetail = (bookId) => {
        const schedule = JSON.parse(localStorage.getItem('bbc_schedule')) || [];
        const currentItem = schedule.find(item => item.id === bookId);
        if (!currentItem) return;

        const localSummaries = JSON.parse(localStorage.getItem('bbc_summaries') || '{}');
        const data = localSummaries[bookId] || summariesDb[bookId];

        const title = data ? data.title : currentItem.book;
        const subtitle = data ? data.subtitle : `${currentItem.author} | ${currentItem.publisher}`;
        const content = data ? data.content : `<p>이 책은 이동우의 비즈니스 북클럽 멤버십의 추천 도서입니다. 매월 4회 세션을 통합한 실물 하드카피 요약본이 모임 현장에서 월 1회 무료 제공됩니다.</p>`;

        document.getElementById('summary-title').textContent = title;
        document.getElementById('summary-subtitle').textContent = subtitle;
        document.getElementById('summary-content').innerHTML = content;
        
        const modalImg = document.getElementById('summary-modal-img');
        if (modalImg) {
            modalImg.src = currentItem.cover;
        }

        const applyBtn = document.getElementById('summary-apply-btn');
        if (applyBtn) {
            applyBtn.onclick = (e) => {
                e.preventDefault();
                closeModal(summaryModal);
                const select = document.getElementById('membership-select');
                select.value = 'Yearly';
                openModal(applyModal);
            };
        }

        openModal(summaryModal);
    };

    // Show dynamic Column full detail modal
    const showColumnModal = (col) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'column-detail-modal';
        
        modal.innerHTML = `
            <div class="modal-content glass-panel">
                <button class="modal-close-btn" onclick="document.getElementById('column-detail-modal').remove(); document.body.style.overflow = '';">&times;</button>
                <div class="modal-header">
                    <span class="badge">Column details</span>
                    <h2>${col.title}</h2>
                    <p>작성자: ${col.author} | 게재일: ${col.date}</p>
                </div>
                <div style="font-size:0.95rem; line-height:1.7; color:var(--text-secondary); max-height:55vh; overflow-y:auto; padding-right:12px;">
                    <p style="white-space: pre-wrap;">${col.content}</p>
                </div>
                <div class="modal-footer">
                    <button class="cta-btn primary-btn" onclick="document.getElementById('column-detail-modal').remove(); document.body.style.overflow = '';">닫기</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    };

    // ==========================================================================
    // 7. Form submissions (Waitlist apply)
    // ==========================================================================
    const applyForm = document.getElementById('apply-form');
    if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('user-name-input').value;
            const phone = document.getElementById('user-phone-input').value;
            const email = document.getElementById('user-email-input').value;
            const company = document.getElementById('user-company-input').value;
            const role = document.getElementById('user-role-input').value;
            const planVal = document.getElementById('membership-select').value;
            
            let planText = "월회원 멤버십";
            if (planVal === "Yearly") planText = "연회원 멤버십";

            const applicant = {
                name: name,
                phone: phone,
                email: email,
                company: company,
                role: role,
                plan: planText,
                timestamp: new Date().toLocaleString('ko-KR')
            };

            // Save to mock database
            const waitlist = JSON.parse(localStorage.getItem('bbc_waitlist')) || [];
            waitlist.push(applicant);
            localStorage.setItem('bbc_waitlist', JSON.stringify(waitlist));

            // Refresh UI
            renderPageData();

            // Open success modal helper
            const showSuccess = () => {
                closeModal(applyModal);
                document.getElementById('submitted-email').textContent = email;
                openModal(successModal);
                applyForm.reset();
            };

            if (GOOGLE_SCRIPT_URL) {
                // Show loading state
                const submitBtn = applyForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = "신청서 전송 중...";

                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(applicant)
                })
                .then(res => res.json())
                .then(data => {
                    console.log('Google Sheet submission success:', data);
                })
                .catch(err => {
                    console.error('Google Sheet submission failed:', err);
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    showSuccess();
                });
            } else {
                showSuccess();
            }
        });
    }

    // ==========================================================================
    // 8. FAQ Accordion Logic
    // ==========================================================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const panel = item.querySelector('.faq-panel');

        trigger.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
                    otherItem.querySelector('.faq-panel').style.maxHeight = null;
                }
            });

            if (isOpen) {
                item.classList.remove('active');
                trigger.setAttribute('aria-expanded', 'false');
                panel.style.maxHeight = null;
            } else {
                item.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    });

    // ==========================================================================
    // 9. Admin Login, Tab switching & Operations
    // ==========================================================================
    const loginBox = document.getElementById('admin-login-box');
    const dashboardContent = document.getElementById('admin-dashboard-content');
    const loginForm = document.getElementById('admin-login-form');
    const loginErrorMsg = document.getElementById('login-error-msg');

    const checkAdminAuth = () => {
        if (sessionStorage.getItem('bbc_admin_logged_in') === 'true') {
            if (loginBox) loginBox.style.display = 'none';
            if (dashboardContent) dashboardContent.style.display = 'block';
        } else {
            if (loginBox) loginBox.style.display = 'block';
            if (dashboardContent) dashboardContent.style.display = 'none';
        }
    };

    checkAdminAuth();

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const idInput = document.getElementById('admin-id').value;
            const pwInput = document.getElementById('admin-pw').value;

            if (idInput === 'pascallab' && pwInput === 'remlee4152') {
                sessionStorage.setItem('bbc_admin_logged_in', 'true');
                if (loginErrorMsg) loginErrorMsg.style.display = 'none';
                loginForm.reset();
                checkAdminAuth();
            } else {
                if (loginErrorMsg) {
                    loginErrorMsg.innerText = '아이디 또는 비밀번호가 올바르지 않습니다.';
                    loginErrorMsg.style.display = 'block';
                }
            }
        });
    }

    const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');

    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            adminTabBtns.forEach(b => b.classList.remove('active'));
            adminTabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            if (targetTab === 'waitlist') {
                fetchGoogleWaitlist();
            }
        });
    });

    // Admin Save Google Script URL
    const saveSheetUrlBtn = document.getElementById('admin-save-sheet-url-btn');
    const sheetUrlInput = document.getElementById('admin-sheet-url-input');
    
    if (saveSheetUrlBtn && sheetUrlInput) {
        sheetUrlInput.value = GOOGLE_SCRIPT_URL;
        saveSheetUrlBtn.addEventListener('click', () => {
            const url = sheetUrlInput.value.trim();
            localStorage.setItem('bbc_google_script_url', url);
            alert('구글 스프레드시트 Web App URL 설정이 성공적으로 저장되었습니다.\n페이지를 새로고침하여 최종 적용해 주세요!');
            location.reload();
        });
    }

    // Admin Upload Cover Zone Interaction
    const uploadZone = document.getElementById('cover-upload-zone');
    const fileInput = document.getElementById('cover-file-input');
    const preview = document.getElementById('upload-preview');
    const zoneText = document.getElementById('upload-zone-text');
    let uploadedDataUrl = "";

    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedDataUrl = event.target.result;
                    preview.src = uploadedDataUrl;
                    preview.style.display = 'block';
                    zoneText.style.display = 'none';
                    // Populate input text too for convenience
                    document.getElementById('cover-image-url').value = "[로컬 이미지 파일 사용됨]";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Cover image edit submission
    const coverForm = document.getElementById('admin-cover-form');
    if (coverForm) {
        coverForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const weekNum = parseInt(document.getElementById('cover-week-select').value, 10);
            const inputUrl = document.getElementById('cover-image-url').value;

            let finalCoverSrc = inputUrl;
            // If file was uploaded, use the Data URL instead of placeholder text
            if (inputUrl === "[로컬 이미지 파일 사용됨]" && uploadedDataUrl) {
                finalCoverSrc = uploadedDataUrl;
            }

            const schedule = JSON.parse(localStorage.getItem('bbc_schedule'));
            const weekItem = schedule.find(item => item.week === weekNum);
            if (weekItem) {
                weekItem.cover = finalCoverSrc;
                localStorage.setItem('bbc_schedule', JSON.stringify(schedule));
                renderPageData();
                alert(`${weekNum}회차 도서 표지가 성공적으로 수정되었습니다!`);
                coverForm.reset();
                if (preview) {
                    preview.style.display = 'none';
                    preview.src = '';
                }
                if (zoneText) zoneText.style.display = 'block';
                uploadedDataUrl = "";
            }
        });
    }

    // Add Book Lineup form submission
    const addBookForm = document.getElementById('admin-add-book-form');
    if (addBookForm) {
        // Auto-populate the next week number as a helper
        const populateNextWeek = () => {
            const schedule = JSON.parse(localStorage.getItem('bbc_schedule')) || [];
            const nextWeekInput = document.getElementById('add-book-week');
            if (nextWeekInput && schedule.length > 0) {
                const maxWeek = Math.max(...schedule.map(item => item.week));
                nextWeekInput.value = maxWeek + 1;
            }
        };

        // Populate on page load or when form is active
        populateNextWeek();

        // Listen for tab click to recalculate the next week
        adminTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.getAttribute('data-tab') === 'add-book') {
                    populateNextWeek();
                }
            });
        });

        addBookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const weekNum = parseInt(document.getElementById('add-book-week').value, 10);
            const date = document.getElementById('add-book-date').value;
            const bookTitle = document.getElementById('add-book-title').value;
            const publisher = document.getElementById('add-book-publisher').value;
            const author = document.getElementById('add-book-author').value;
            const lecturer = document.getElementById('add-book-lecturer').value;
            const cover = document.getElementById('add-book-cover').value;
            const summaryHtml = document.getElementById('add-book-summary').value;

            const newId = `book_dynamic_${Date.now()}`;

            const newItem = {
                week: weekNum,
                date: date,
                id: newId,
                book: bookTitle,
                publisher: publisher,
                author: author,
                lecturer: lecturer,
                cover: cover
            };

            // Store in schedule database
            const schedule = JSON.parse(localStorage.getItem('bbc_schedule')) || [];
            schedule.push(newItem);
            // Sort by week number so it displays in order!
            schedule.sort((a, b) => a.week - b.week);
            localStorage.setItem('bbc_schedule', JSON.stringify(schedule));

            // Store in summaries database
            if (summaryHtml) {
                const localSummaries = JSON.parse(localStorage.getItem('bbc_summaries') || '{}');
                localSummaries[newId] = {
                    title: bookTitle,
                    subtitle: `${author} | ${publisher}`,
                    content: summaryHtml
                };
                localStorage.setItem('bbc_summaries', JSON.stringify(localSummaries));
            }

            renderPageData();
            alert(`${weekNum}회차 도서 《${bookTitle}》가 성공적으로 라인업에 추가되었습니다!`);
            addBookForm.reset();
            populateNextWeek();
        });
    }

    // Download Proposal file mock click
    const downloadProposalBtns = document.querySelectorAll('.download-proposal-btn');
    downloadProposalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert("인사이티파이(Insitify) 프리미엄 연동 서비스 소개서 다운로드가 임시 시작되었습니다. (제안서 파일 준비 완료)");
        });
    });

    // Initialize all visual data rendering
    renderPageData();
});
