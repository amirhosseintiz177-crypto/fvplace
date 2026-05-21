import {
  marketingNav,
  appNav,
  metrics,
  pillars,
  productSurfaces,
  story,
  dashboardFallback,
  workspacesFallback,
  teamFallback,
  activityFallback,
  settingsCards,
  tourSteps,
  solutions,
  securityLayers,
  pricingPlans,
  profileFallbackFiles,
  fileManagerFallback,
} from './data.js';
import { escapeHtml, initials, linkHref } from './utils.js';

function marketingLinks(activePath) {
  return marketingNav
    .map((item) => `<a href="${linkHref(item.href)}" class="${activePath === item.href ? 'is-active' : ''}">${escapeHtml(item.label)}</a>`)
    .join('');
}

function appLinks(activePath) {
  return appNav
    .map(
      (item) => `
        <a href="${linkHref(item.href)}" class="nav-chip ${activePath === item.href ? 'is-active' : ''}">
          <span>${escapeHtml(item.label)}</span>
          <small>${escapeHtml(item.short)}</small>
        </a>
      `,
    )
    .join('');
}

function footerColumns() {
  const columns = [
    {
      title: 'محصول',
      links: [
        { label: 'تور محصول', href: '/tour/' },
        { label: 'راهکارها', href: '/solutions/' },
        { label: 'تعرفه ها', href: '/pricing/' },
      ],
    },
    {
      title: 'اعتماد',
      links: [
        { label: 'امنیت', href: '/security/' },
        { label: 'صفحه اشتراک', href: '/share/demo/' },
        { label: 'پروفایل عمومی', href: '/profile/nova/' },
      ],
    },
    {
      title: 'شروع',
      links: [
        { label: 'ورود', href: '/login/' },
        { label: 'ثبت نام', href: '/register/' },
        { label: 'داشبورد', href: '/dashboard/' },
      ],
    },
  ];

  return columns
    .map(
      (column) => `
        <div>
          <h3 class="text-brand mt-0">${escapeHtml(column.title)}</h3>
          <div class="footer-links stack mt-3">
            ${column.links.map((link) => `<a href="${linkHref(link.href)}">${escapeHtml(link.label)}</a>`).join('')}
          </div>
        </div>
      `,
    )
    .join('');
}

export function marketingShell({ activePath, content }) {
  return `
    <div class="marketing-shell shell-root">
      <div class="hero-orb hero-orb-a"></div>
      <div class="hero-orb hero-orb-b"></div>
      <div class="hero-orb hero-orb-c"></div>
      <header class="marketing-header">
        <a href="${linkHref('/')}" class="brand-mark">
          <span class="brand-mark__icon">FV</span>
          <span>
            <strong>FVPlace Nova</strong>
            <small>Storage Experience Platform</small>
          </span>
        </a>
        <nav class="marketing-nav">${marketingLinks(activePath)}</nav>
        <div class="header-actions">
          <a href="${linkHref('/login/')}" class="btn-ghost">ورود</a>
          <a href="${linkHref('/dashboard/')}" class="btn-primary">ورود به اپ</a>
        </div>
      </header>
      <main class="marketing-main">${content}</main>
      <footer class="footer-wrap">
        <section class="panel footer-panel">
          <div class="story-grid">
            <div>
              <a href="${linkHref('/')}" class="brand-mark">
                <span class="brand-mark__icon">FV</span>
                <span>
                  <strong>FVPlace Nova</strong>
                  <small>Built for teams that care about delivery quality</small>
                </span>
              </a>
              <p class="section-copy mt-4">یک تجربه کامل برای ذخیره سازی، مدیریت، نمایش و تحویل فایل. از لندینگ تا پنل داخلی، از صفحه اشتراک تا پروفایل عمومی، همه چیز داخل یک زبان طراحی واحد ساخته شده است.</p>
            </div>
            <div class="footer-columns">${footerColumns()}</div>
          </div>
        </section>
      </footer>
    </div>
  `;
}

export function appShell({ activePath, user, content }) {
  const userBlock = user
    ? `<button class="btn-ghost js-logout">خروج از ${escapeHtml(user.name)}</button>`
    : `<a href="${linkHref('/login/')}" class="btn-primary">ورود / ثبت نام</a>`;

  return `
    <div class="app-shell">
      <aside class="app-frame sidebar">
        <div class="sidebar-inner">
          <a href="${linkHref('/')}" class="brand-mark">
            <span class="brand-mark__icon">FV</span>
            <span>
              <strong>FVPlace Nova</strong>
              <small>Control Surface</small>
            </span>
          </a>
          <div class="surface-card app-quick-card mt-5">
            <p class="caps-label mt-0">Quick Control</p>
            <p class="mt-2"><strong>فرمان سریع و ناوبری روشن</strong></p>
            <p class="subtle-copy mt-2">با <span class="kbd">Ctrl</span> + <span class="kbd">K</span> به میانبرها و عملیات اصلی برسید.</p>
          </div>
          <nav class="sidebar-nav mt-5">${appLinks(activePath)}</nav>
          <div class="sidebar-footer sidebar-stats mt-5">
            <div class="info-tile">
              <p class="muted mt-0">سقف آپلود</p>
              <strong class="text-brand">1024MB</strong>
            </div>
            <div class="info-tile">
              <p class="muted mt-0">وضعیت حساب</p>
              <strong>${escapeHtml(user?.name || 'مهمان')}</strong>
            </div>
          </div>
          <div class="sidebar-footer sidebar-account mt-5">${userBlock}</div>
        </div>
      </aside>
      <main class="app-main">
        <div class="app-frame app-topbar">
          <div class="app-topbar__meta">
            <a href="${linkHref('/')}" class="brand-mark">
              <span class="brand-mark__icon">FV</span>
              <span>
                <strong>FVPlace Nova</strong>
                <small>Workspace Console</small>
              </span>
            </a>
            <div class="app-topbar__copy">
              <span class="caps-label">Active Surface</span>
              <p class="muted mt-2">یک فضای مرتب برای مدیریت فایل، اشتراک امن و همکاری تیمی.</p>
            </div>
          </div>
          <div class="app-topbar__actions">
            <div class="status-pill is-success">Live Surface</div>
            <a href="${linkHref('/files/')}" class="btn-secondary">باز کردن فایل ها</a>
          </div>
        </div>
        <div class="app-frame mobile-bar">
          <a href="${linkHref('/')}" class="brand-mark">
            <span class="brand-mark__icon">FV</span>
            <span>
              <strong>FVPlace</strong>
              <small>Mobile Surface</small>
            </span>
          </a>
          <a href="${linkHref('/files/')}" class="btn-primary">فایل ها</a>
        </div>
        <div class="mobile-nav">${appNav
          .map((item) => `<a href="${linkHref(item.href)}" class="nav-chip ${activePath === item.href ? 'is-active' : ''}">${escapeHtml(item.label)}</a>`)
          .join('')}</div>
        <div class="app-content">${content}</div>
      </main>
    </div>
  `;
}

function homePage() {
  return `
    <div class="home-shell fade-in">
      <section class="hero-stage">
        <div class="hero-grid">
          <div>
            <span class="hero-kicker">Storage experience platform for teams with taste</span>
            <h1 class="hero-display mt-4">فضای فایل و تحویل حرفه ای که واقعا خوش ساخت، منظم و قابل اتکاست.</h1>
            <p class="hero-subcopy mt-4">FVPlace Nova فقط یک UI تزئینی یا یک آپلودر خام نیست. اینجا یک محصول کامل برای معرفی، مدیریت فایل، همکاری تیمی، اشتراک گذاری امن و نمایش عمومی فایل ها ساخته شده که از همان نگاه اول باید حس کیفیت، تمرکز و اعتماد بدهد.</p>
            <div class="hero-actions mt-4">
              <a href="${linkHref('/dashboard/')}" class="btn-primary">ورود به پنل</a>
              <a href="${linkHref('/tour/')}" class="btn-secondary">دیدن تور محصول</a>
              <a href="${linkHref('/pricing/')}" class="btn-ghost">مرور تعرفه ها</a>
            </div>
          </div>
          <div class="stack">
            <div class="hero-side-card">
              <div class="inline-actions" style="justify-content: space-between; align-items: center;">
                <div>
                  <p class="caps-label mt-0">Product Surface</p>
                  <h2 class="mt-2 mb-0">چیدمان محصول</h2>
                </div>
                <span class="badge">هماهنگ و یکپارچه</span>
              </div>
              <div class="two-col mt-4">
                ${productSurfaces
                  .slice(0, 4)
                  .map(
                    (surface) => `
                      <div class="surface-card">
                        <p class="caps-label mt-0">${escapeHtml(surface.name)}</p>
                        <h3 class="mt-2 mb-0">${escapeHtml(surface.title)}</h3>
                        <p class="muted mt-2">${escapeHtml(surface.desc)}</p>
                      </div>
                    `,
                  )
                  .join('')}
              </div>
            </div>
            <div class="hero-side-card">
              <p class="caps-label mt-0">Visual Promise</p>
              <p class="mt-2 mb-0">این نسخه باید از شلوغی بی هدف فاصله بگیرد و بیشتر شبیه یک برند luxury-tech تمیز، جدی و بااعتماد دیده شود.</p>
            </div>
          </div>
        </div>
        <div class="soft-divider"></div>
        <div class="hero-metrics">
          ${metrics
            .map(
              (item) => `
                <div class="hero-metric info-tile">
                  <strong>${escapeHtml(item.value)}</strong>
                  <p class="muted mt-2">${escapeHtml(item.label)}</p>
                </div>
              `,
            )
            .join('')}
        </div>
      </section>

      <section class="story-grid mt-4">
        <article class="editorial-card panel">
          <p class="caps-label mt-0">Why It Feels Better</p>
          <h2 class="editorial-title mt-4">حالا صفحه اصلی به جای درهم بودن، با hierarchy، spacing و سکوت بصری درست کار می کند.</h2>
          <p class="section-copy mt-4">ما تمرکز را از صرفا glow و glass به روی ترکیب بندی، فاصله گذاری، ریتم متن و وضوح مسیرها بردیم. نتیجه باید این باشد که چشم کاربر خسته نشود و هر سکشن نقش مشخص خودش را داشته باشد.</p>
          <div class="two-col mt-4">
            <div class="surface-card">
              <p class="caps-label mt-0">Structure</p>
              <p class="mt-2 mb-0"><strong>معرفی، سناریو، پنل و تحویل فایل</strong></p>
            </div>
            <div class="surface-card">
              <p class="caps-label mt-0">Direction</p>
              <p class="mt-2 mb-0"><strong>Editorial layout با حال و هوای premium-tech</strong></p>
            </div>
          </div>
        </article>
        <article class="editorial-card panel">
          <p class="caps-label mt-0">Journey</p>
          <div class="stack mt-4">
            ${story
              .map(
                (item, index) => `
                  <div class="file-row" style="align-items: start;">
                    <div class="story-index text-brand">0${index + 1}</div>
                    <div><p class="muted mt-0">${escapeHtml(item)}</p></div>
                  </div>
                `,
              )
              .join('')}
          </div>
        </article>
      </section>

      <section class="feature-grid mt-4">
        ${pillars
          .map(
            (pillar) => `
              <article class="editorial-card panel">
                <p class="caps-label mt-0">Feature</p>
                <h3 class="mt-3 mb-0">${escapeHtml(pillar.title)}</h3>
                <p class="muted mt-3">${escapeHtml(pillar.text)}</p>
              </article>
            `,
          )
          .join('')}
      </section>

      <section class="editorial-card panel mt-4">
        <div class="content-grid">
          <div>
            <p class="caps-label mt-0">Complete Surface</p>
            <h2 class="editorial-title mt-4">این محصول فقط یک لندینگ نیست؛ یک اکوسیستم کامل برای فایل، تیم و ارائه حرفه ای است.</h2>
          </div>
          <div class="three-col">
            ${productSurfaces
              .map(
                (surface) => `
                  <div class="surface-card">
                    <p class="caps-label mt-0">${escapeHtml(surface.name)}</p>
                    <h3 class="mt-2 mb-0">${escapeHtml(surface.title)}</h3>
                    <p class="muted mt-2">${escapeHtml(surface.desc)}</p>
                  </div>
                `,
              )
              .join('')}
          </div>
        </div>
      </section>
    </div>
  `;
}

function dashboardPage() {
  return `
    <section class="section-hero dashboard-hero fade-in">
      <div class="dashboard-hero__grid">
        <div>
          <span class="eyebrow">داشبورد مرکزی</span>
          <h1 class="display-title mt-4">مرکز فرمان فایل ها، تیم، اشتراک و تحویل حرفه ای</h1>
          <p class="subtle-copy mt-4">در این نما، کاربر باید حس کند وارد یک اتاق عملیات واقعی شده است: داده دارد، مسیر دارد، عملیات سریع دارد و از اینجا می تواند به فایل ها، اشتراک ها و پروفایل عمومی برود.</p>
        </div>
        <div class="dashboard-hero__aside">
          <div class="surface-card">
            <p class="caps-label mt-0">Today Focus</p>
            <h3 class="mt-2 mb-0">آپلود، مرور فعالیت و ساخت لینک اشتراک</h3>
            <p class="muted mt-2">چند مسیر مهم را بدون شلوغی زیاد، همین ابتدای صفحه پیش روی کاربر بگذار.</p>
          </div>
          <div class="hero-actions">
          <a href="${linkHref('/files/')}" class="btn-primary">مدیریت فایل ها</a>
          <a href="${linkHref('/share/demo/')}" class="btn-ghost">صفحه اشتراک</a>
          </div>
        </div>
      </div>
      <div class="stats-grid dashboard-stats mt-4 js-dashboard-stats">
        ${dashboardFallback.stats.map((stat) => `<div class="info-tile"><span class="muted">${escapeHtml(stat.label)}</span><strong>${escapeHtml(stat.value)}</strong></div>`).join('')}
      </div>
    </section>

    <section class="dashboard-grid js-dashboard-content">
      <div class="glass-card">
        <div class="inline-actions" style="justify-content: space-between; align-items: end;">
          <div>
            <p class="muted mt-0">Storage Overview</p>
            <h2 class="mt-2 mb-0">8.4 GB / 15 GB</h2>
          </div>
          <span class="badge">56% مصرف شده</span>
        </div>
        <div class="chart-track mt-4"><span class="c1" style="width: 44%"></span><span class="c2" style="width: 24%"></span><span class="c3" style="width: 18%"></span><span class="c4" style="width: 14%"></span></div>
        <div class="four-col mt-4">
          <div class="segment-card"><div><span class="legend-dot c1"></span>ویدیو</div><strong class="mt-2">44%</strong></div>
          <div class="segment-card"><div><span class="legend-dot c2"></span>تصویر</div><strong class="mt-2">24%</strong></div>
          <div class="segment-card"><div><span class="legend-dot c3"></span>سند</div><strong class="mt-2">18%</strong></div>
          <div class="segment-card"><div><span class="legend-dot c4"></span>کد و سایر</div><strong class="mt-2">14%</strong></div>
        </div>
      </div>

      <div class="stack">
        <div class="glass-card">
          <h2 class="mt-0">میانبرهای امروز</h2>
          <div class="stack mt-3">
            ${['آپلود فایل جدید', 'ساخت پوشه برای مشتری', 'مرور فعالیت تیم', 'باز کردن لینک های اشتراک'].map((item) => `<div class="info-tile">${escapeHtml(item)}</div>`).join('')}
          </div>
        </div>
      </div>

      <div class="glass-card">
        <div class="inline-actions" style="justify-content: space-between; align-items: center;">
          <h2 class="mt-0 mb-0">فضاهای کاری و فایل های مهم</h2>
          <a href="${linkHref('/files/')}" class="text-brand">مشاهده همه</a>
        </div>
        <div class="two-col mt-4 js-dashboard-files">
          ${dashboardFallback.files.map((file) => `<div class="info-tile"><p class="mt-0"><strong>${escapeHtml(file)}</strong></p><p class="muted mt-2">به روزرسانی شده در همین امروز</p></div>`).join('')}
        </div>
      </div>

      <div class="glass-card">
        <h2 class="mt-0">جریان فعالیت لحظه ای</h2>
        <div class="stack mt-4 js-dashboard-activity">
          ${dashboardFallback.activities
            .map(
              (activity, index) => `
                <div class="file-row">
                  <div class="activity-index text-brand">0${index + 1}</div>
                  <div class="activity-copy">
                    <p class="mt-0"><strong>${escapeHtml(activity)}</strong></p>
                    <p class="muted mt-1">Realtime event</p>
                  </div>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function workspacesPage() {
  return `
    <section class="panel section-hero fade-in" style="padding: 1.6rem; margin-bottom: 1rem;">
      <div class="content-grid">
        <div>
          <span class="eyebrow">Workspaces</span>
          <h1 class="display-title mt-4">فضاهای کاری را هم به یک مقصد واقعی داخل محصول تبدیل کردم.</h1>
          <p class="section-copy mt-4">این صفحه برای زمانی است که کاربر چند تیم، چند مشتری یا چند جریان تحویل فایل دارد و باید بین آن ها جابه جا شود بدون اینکه تجربه محصول از هم بپاشد.</p>
        </div>
        <div class="hero-actions" style="justify-content: end; align-self: end;">
          <button class="btn-secondary js-create-workspace">ساخت Workspace جدید</button>
          <a href="${linkHref('/files/')}" class="btn-primary">باز کردن فایل های Workspace</a>
        </div>
      </div>
      <div class="notice is-success mt-4 js-workspace-summary">می توانید یک workspace جدید بسازید یا از داده های API برای همین بخش استفاده کنید.</div>
    </section>
    <section class="workspace-grid page-split js-workspaces-list">
      <div class="stack">
        ${workspacesFallback
          .map(
            (workspace) => `
              <div class="workspace-card">
                <div class="content-grid">
                  <div>
                    <h2>${escapeHtml(workspace.name)}</h2>
                    <p class="workspace-meta">نقش شما: ${escapeHtml(workspace.role)}</p>
                  </div>
                  <div class="workspace-meta">
                    <p class="mt-0">اعضا: ${escapeHtml(String(workspace.members))}</p>
                    <p class="mt-1">حجم مصرفی: ${escapeHtml(workspace.storage)}</p>
                  </div>
                </div>
              </div>
            `,
          )
          .join('')}
      </div>
      <div class="glass-card">
        <h2 class="mt-0">چرا این صفحه مهم است؟</h2>
        <p class="muted mt-3">وقتی سایت فقط داشبورد و فایل داشته باشد، محصول ناقص حس می شود. ورک اسپیس ها لایه سازمانی محصول را قابل لمس می کنند.</p>
      </div>
    </section>
  `;
}

function teamPage() {
  return `
    <section class="panel section-hero fade-in" style="padding: 1.6rem; margin-bottom: 1rem;">
      <div class="content-grid">
        <div>
          <span class="eyebrow">Team Surface</span>
          <h1 class="display-title mt-4">اعضای تیم هم حالا یک مقصد مستقل و خوش ساخت دارند.</h1>
          <p class="section-copy mt-4">این صفحه برای نمایش نقش ها، وضعیت اعضا و مسیر دعوت یا مدیریت همکاری ساخته شد تا لایه تیمی محصول فقط در حد یک مفهوم باقی نماند.</p>
        </div>
        <div class="hero-actions" style="justify-content: end; align-self: end;">
          <button class="btn-primary js-invite-member">دعوت عضو جدید</button>
          <a href="${linkHref('/workspaces/')}" class="btn-ghost">مدیریت Workspace</a>
        </div>
      </div>
    </section>
    <section class="team-grid fade-in">
      <div class="stack js-team-list">
        ${teamFallback
          .map(
            (member, index) => `
              <div class="member-card">
                <div class="content-grid">
                  <div class="file-main">
                    <div class="member-index ${member.accent}">${index + 1}</div>
                    <div class="member-copy">
                      <h2>${escapeHtml(member.name)}</h2>
                      <p class="member-meta">${escapeHtml(member.role)}</p>
                    </div>
                  </div>
                  <div class="status-pill">${escapeHtml(member.status)}</div>
                </div>
              </div>
            `,
          )
          .join('')}
      </div>
      <div class="glass-card">
        <h2 class="mt-0">کنترل های تیم</h2>
        <ul class="activity-points mt-4">
          <li>• نقش های Owner / Admin / Editor / Viewer</li>
          <li>• دعوت سریع به ورک اسپیس ها</li>
          <li>• مشاهده وضعیت و اکتیویتی اعضا</li>
          <li>• پایه مناسب برای اتصال بعدی به API واقعی اعضا</li>
        </ul>
        <div class="notice is-success mt-4 js-team-hint">دعوت سریع اعضا حتی در حالت دموی وانیلا هم فعال است.</div>
      </div>
    </section>
  `;
}

function activityPage() {
  return `
    <section class="panel section-hero fade-in" style="padding: 1.6rem; margin-bottom: 1rem;">
      <span class="eyebrow">Activity Feed</span>
      <h1 class="display-title mt-4">مسیر اکتیویتی هم الان یک صفحه مستقل و تمیز دارد.</h1>
      <p class="section-copy mt-4">وقتی چند نفر داخل یک workspace کار می کنند، جریان رویدادها خودش باید یک مقصد مهم باشد. این صفحه برای خوانایی، پیگیری و حس زنده بودن محصول ساخته شد.</p>
    </section>
    <section class="activity-grid fade-in">
      <div class="glass-card js-activity-list">
        <div class="stack">
          ${activityFallback
            .map(
              (item, index) => `
                <div class="activity-card file-row">
                  <div class="activity-index ${item.accent}">0${index + 1}</div>
                  <div class="activity-copy">
                    <p class="muted mt-0">${escapeHtml(item.action)}</p>
                    <h2 class="mt-1">${escapeHtml(item.title)}</h2>
                    <p class="member-meta">${escapeHtml(item.time)}</p>
                  </div>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>
      <div class="glass-card">
        <h2 class="mt-0">فایده این صفحه</h2>
        <ul class="activity-points mt-4">
          <li>• مشاهده رویدادهای کلیدی بدون ورود به تک تک بخش ها</li>
          <li>• حس زنده بودن تیم و محصول</li>
          <li>• پایه مناسب برای اتصال بعدی به رویدادهای زنده</li>
        </ul>
      </div>
    </section>
  `;
}

function settingsPage() {
  return `
    <section class="panel section-hero fade-in" style="padding: 1.6rem; margin-bottom: 1rem;">
      <span class="eyebrow">Settings</span>
      <h1 class="display-title mt-4">همه چیز را برای تیم، برند و شیوه کار خودتان تنظیم کنید.</h1>
      <p class="section-copy mt-4">از آدرس اپ و API گرفته تا ظاهر، تراکم نمایش و رفتار اعلان ها؛ اینجا جایی است که تجربه FVPlace را برای استفاده واقعی آماده می کنید.</p>
    </section>
    <section class="settings-grid fade-in">
      ${settingsCards
        .map(
          (card) => `
            <div class="settings-card">
              <h2>${escapeHtml(card.title)}</h2>
              <p class="muted mt-3">${escapeHtml(card.body)}</p>
              <div class="surface-card mt-4">این گزینه ها مستقیم روی همین نسخه اعمال می شوند و نتیجه را فوری می بینید.</div>
            </div>
          `,
        )
        .join('')}
      <section class="settings-card">
        <h2>تنظیمات تجربه وانیلا</h2>
        <p class="muted mt-3">این تنظیمات داخل همین نسخه ذخیره می شوند تا ظاهر، اتصال و رفتار محیط کاری شما همیشه یکدست باقی بماند.</p>
        <form class="form-row mt-4 js-settings-form">
          <label class="form-row">
            <span>تم رنگی</span>
            <select class="select" name="accent">
              <option value="mint">Mint Nova</option>
              <option value="sunset">Sunset Glow</option>
              <option value="ocean">Ocean Signal</option>
            </select>
          </label>
          <label class="form-row">
            <span>چگالی نمایش</span>
            <select class="select" name="density">
              <option value="comfortable">راحت</option>
              <option value="compact">فشرده</option>
            </select>
          </label>
          <label class="inline-actions toggle-row">
            <span>انیمیشن نرم</span>
            <input type="checkbox" name="motion" checked />
          </label>
          <label class="inline-actions toggle-row">
            <span>اعلان های شروع هر صفحه</span>
            <input type="checkbox" name="notifications" checked />
          </label>
          <label class="form-row">
            <span>نشانی اپ وانیلا</span>
            <input class="field" name="appBaseUrl" placeholder="https://fvplace.runflare.run" />
          </label>
          <label class="form-row">
            <span>نشانی API</span>
            <input class="field" name="apiBaseUrl" placeholder="https://fvplace.runflare.run" />
          </label>
          <div class="inline-actions mt-3">
            <button class="btn-primary" type="submit">ذخیره تنظیمات</button>
            <button class="btn-ghost js-reset-settings" type="button">بازنشانی</button>
          </div>
        </form>
        <div class="two-col mt-4">
          <button class="btn-soft js-test-api" type="button">تست اتصال API</button>
          <button class="btn-soft js-export-settings" type="button">خروجی تنظیمات</button>
        </div>
        <label class="form-row mt-4">
          <span>ورودی تنظیمات</span>
          <textarea class="textarea js-import-settings" rows="6" placeholder='{"appBaseUrl":"https://fvplace.runflare.run","apiBaseUrl":"https://fvplace.runflare.run"}'></textarea>
        </label>
        <div class="inline-actions mt-3">
          <button class="btn-ghost js-apply-import" type="button">اعمال ورودی</button>
          <div class="status-pill js-settings-status is-warning">آماده</div>
        </div>
      </section>
    </section>
  `;
}

function tourPage() {
  return `
    <section class="page-shell py-hero fade-in">
      <div class="panel" style="padding: 1.6rem; border-radius: 2.8rem;">
        <span class="eyebrow">تور محصول</span>
        <h1 class="section-title mt-4">اگر کاربر بخواهد کل سایت را حس کند، اینجا مسیر کامل تجربه را می بیند.</h1>
        <p class="section-copy mt-4">این صفحه برای این ساخته شد که معرفی محصول فقط در یک Hero تمام نشود. حالا می توانیم مراحل مختلف تجربه را جداگانه نمایش بدهیم و محصول را خیلی حرفه ای تر ارائه کنیم.</p>
        <div class="two-col mt-4">
          ${tourSteps
            .map(
              (step, index) => `
                <article class="step-card">
                  <p class="caps-label mt-0">Step 0${index + 1}</p>
                  <h2 class="mt-2">${escapeHtml(step.title)}</h2>
                  <p class="muted mt-3">${escapeHtml(step.body)}</p>
                </article>
              `,
            )
            .join('')}
        </div>
        <div class="hero-actions mt-4">
          <a href="${linkHref('/dashboard/')}" class="btn-primary">شروع از داشبورد</a>
          <a href="${linkHref('/files/')}" class="btn-secondary">دیدن هاب فایل</a>
          <a href="${linkHref('/security/')}" class="btn-ghost">مرور امنیت</a>
        </div>
      </div>
    </section>
  `;
}

function solutionsPage() {
  return `
    <section class="page-shell py-hero fade-in">
      <div class="panel" style="padding: 1.6rem; border-radius: 2.8rem;">
        <span class="eyebrow">راهکارها</span>
        <h1 class="section-title mt-4">هر کسب و کار، نسخه متفاوتی از FVPlace را تجربه می کند.</h1>
        <p class="section-copy mt-4">این صفحه برای معرفی سناریوهای واقعی طراحی شده تا کاربر بفهمد محصول فقط یک فضای آپلود نیست، بلکه یک لایه کامل برای مدیریت، ارائه و تحویل فایل است.</p>
        <div class="three-col mt-4">
          ${solutions
            .map(
              (item) => `
                <article class="solution-card">
                  <h2>${escapeHtml(item.title)}</h2>
                  <p class="muted mt-3">${escapeHtml(item.text)}</p>
                  <ul class="feature-list mt-4">${item.points.map((point) => `<li>• ${escapeHtml(point)}</li>`).join('')}</ul>
                </article>
              `,
            )
            .join('')}
        </div>
        <div class="hero-actions mt-4">
          <a href="${linkHref('/pricing/')}" class="btn-primary">مقایسه پلن ها</a>
          <a href="${linkHref('/dashboard/')}" class="btn-ghost">ورود به تجربه محصول</a>
        </div>
      </div>
    </section>
  `;
}

function securityPage() {
  return `
    <section class="page-shell py-hero fade-in">
      <div class="share-grid">
        <div class="panel" style="padding: 1.6rem; border-radius: 2.8rem;">
          <span class="eyebrow">امنیت و اعتماد</span>
          <h1 class="section-title mt-4">صفحه امنیت باید حس اطمینان بدهد، نه فقط چند جمله پراکنده.</h1>
          <p class="section-copy mt-4">برای همین این بخش را به عنوان مقصد مستقل ساخته ایم تا مشتری یا تیم فنی شما دقیقا ببیند کنترل فایل، کنترل دسترسی و تجربه اشتراک گذاری چطور مدیریت می شود.</p>
          <div class="stack mt-4">
            ${securityLayers
              .map(
                (item, index) => `
                  <div class="surface-card">
                    <p class="caps-label mt-0">Layer 0${index + 1}</p>
                    <p class="mt-2 mb-0">${escapeHtml(item)}</p>
                  </div>
                `,
              )
              .join('')}
          </div>
        </div>
        <div class="panel" style="padding: 1.6rem; border-radius: 2.8rem;">
          <div class="surface-card" style="background: rgba(158, 243, 221, 0.1); border-color: rgba(158, 243, 221, 0.2);">
            <p class="text-brand mt-0">خلاصه وضعیت محصول</p>
            <div class="two-col mt-4">
              <div class="metric-card"><span class="muted">حداکثر آپلود</span><strong>1024MB</strong></div>
              <div class="metric-card"><span class="muted">اشتراک</span><strong>Secure</strong></div>
              <div class="metric-card"><span class="muted">مدل استقرار</span><strong>Self-hosted</strong></div>
              <div class="metric-card"><span class="muted">معماری</span><strong>API + Web</strong></div>
            </div>
          </div>
          <div class="surface-card mt-4">
            <h2 class="mt-0">وقتی کاربر روی /share یا /profile می رود، هنوز داخل همان هویت امن و حرفه ای باقی می ماند.</h2>
            <p class="muted mt-3">این یک تفاوت مهم است: امنیت فقط داخل API نیست؛ در طراحی تجربه کاربر هم باید اعتماد، وضوح و پیش بینی پذیری دیده شود.</p>
          </div>
          <div class="hero-actions mt-4">
            <a href="${linkHref('/share/demo/')}" class="btn-primary">دیدن صفحه اشتراک</a>
            <a href="${linkHref('/profile/nova/')}" class="btn-ghost">دیدن پروفایل عمومی</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function pricingPage() {
  return `
    <section class="page-shell py-hero fade-in">
      <div class="panel" style="padding: 1.6rem; border-radius: 2.8rem;">
        <div class="content-grid">
          <div>
            <span class="eyebrow">تعرفه ها</span>
            <h1 class="section-title mt-4">چیدمان تعرفه ها هم باید شیک باشد، هم واضح، هم متناسب با حس محصول.</h1>
          </div>
          <p class="section-copy">این صفحه الان نقش یک مقصد واقعی را بازی می کند؛ نه صرفا یک باکس قیمت. کاربر می تواند پلن مناسب خود را بفهمد و وارد همان تجربه شود.</p>
        </div>
        <div class="pricing-grid mt-4">
          ${pricingPlans
            .map(
              (plan, index) => `
                <article class="plan-card ${index === 1 ? 'is-featured' : ''}" style="${index === 1 ? 'background: rgba(158, 243, 221, 0.1); border-color: rgba(158, 243, 221, 0.25); box-shadow: 0 0 30px rgba(158, 243, 221, 0.12);' : ''}">
                  <p class="muted mt-0">${escapeHtml(plan.name)}</p>
                  <h2 class="mt-2">${escapeHtml(plan.price)}</h2>
                  <p class="muted mt-3">${escapeHtml(plan.caption)}</p>
                  <ul class="plan-points mt-4">${plan.points.map((point) => `<li>• ${escapeHtml(point)}</li>`).join('')}</ul>
                  <a href="${linkHref(plan.cta)}" class="${index === 1 ? 'btn-primary' : 'btn-ghost'} mt-4">انتخاب مسیر</a>
                </article>
              `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function authPage(mode) {
  const isRegister = mode === 'register';
  return `
    <main class="auth-shell fade-in">
      <div class="hero-orb hero-orb-a"></div>
      <div class="hero-orb hero-orb-b"></div>
      <section class="auth-grid page-shell">
        <aside class="section-hero auth-side-panel">
          <span class="eyebrow">FVPlace Nova Access</span>
          <h1 class="display-title mt-4">${isRegister ? 'فضای فایل خودتان را در چند دقیقه راه بیندازید.' : 'به فضای کاری امن و مرتب خودتان برگردید.'}</h1>
          <p class="subtle-copy mt-4">بعد از ورود، مستقیم به یک محیط واقعی برای آپلود، سازماندهی فایل ها، تحویل حرفه ای به مشتری و نمایش عمومی محتوای منتخب خودتان می رسید.</p>
          <div class="two-col mt-4">
            ${['آپلود تا 1024MB', 'لینک اشتراک حرفه ای', 'پروفایل عمومی', 'ساختار تیمی'].map((item) => `<div class="info-tile">${escapeHtml(item)}</div>`).join('')}
          </div>
        </aside>
        <section class="auth-card">
          <p class="caps-label mt-0">${isRegister ? 'ثبت نام' : 'ورود'}</p>
          <h2 class="mt-2">${isRegister ? 'ساخت حساب جدید' : 'ورود به حساب'}</h2>
          <p class="subtle-copy mt-2">${isRegister ? 'با ساخت حساب، فایل ها، پوشه ها، اشتراک گذاری و صفحه عمومی خودتان را در یک جا مدیریت می کنید.' : 'برای ادامه کار روی فایل ها، لینک های اشتراک و محیط تیمی خود وارد شوید.'}</p>
          <div class="js-auth-alert mt-4 hidden"></div>
          <form class="form-row mt-4 js-auth-form" data-mode="${mode}">
            ${isRegister ? '<input class="field" name="name" required minlength="2" placeholder="نام یا نام تیم" />' : ''}
            <input class="field" name="email" required type="email" placeholder="ایمیل" />
            <div class="password-row">
              <input class="field js-password-field" name="password" required minlength="8" type="password" placeholder="رمز عبور" />
              <button type="button" class="password-toggle js-password-toggle">نمایش</button>
            </div>
            <button class="btn-primary" type="submit">${isRegister ? 'ساخت حساب' : 'ورود به پنل'}</button>
          </form>
          <p class="muted mt-4">${isRegister ? 'حساب دارید؟' : 'حساب ندارید؟'} <a class="text-brand" href="${linkHref(isRegister ? '/login/' : '/register/')}">${isRegister ? 'وارد شوید' : 'ثبت نام کنید'}</a></p>
        </section>
      </section>
    </main>
  `;
}

function filesPage() {
  const panels = fileManagerFallback.quickPanels;
  return `
    <section class="section-hero fade-in" style="padding: 1.6rem; margin-bottom: 1rem;">
      <div class="content-grid">
        <div>
          <span class="eyebrow">File Hub</span>
          <h1 class="display-title mt-4">یک هاب مرتب برای آپلود، سازماندهی و تحویل فایل های مهم</h1>
          <p class="subtle-copy mt-4">در این بخش می توانید پوشه بسازید، فایل ها را جابجا کنید، پیش نمایش بگیرید، برایشان یادداشت بگذارید و با چند کلیک یک لینک آماده ارسال بسازید.</p>
        </div>
        <div class="hero-actions" style="justify-content: end; align-self: end;">
          <a href="${linkHref('/share/demo/')}" class="btn-secondary">نمونه صفحه تحویل</a>
          <a href="${linkHref('/profile/nova/')}" class="btn-ghost">صفحه عمومی من</a>
        </div>
      </div>
      <div class="three-col mt-4">
        ${panels.map((panel) => `<div class="info-tile"><h2 class="mt-0">${escapeHtml(panel.title)}</h2><p class="muted mt-2">${escapeHtml(panel.copy)}</p></div>`).join('')}
      </div>
    </section>
    <section class="files-root js-file-manager-root"></section>
  `;
}

export function profilePage(username = 'nova') {
  return `
    <main class="page-shell py-hero fade-in js-profile-root" data-username="${escapeHtml(username)}">
      <section class="section-hero" style="padding: 1.6rem;">
        <div class="profile-header">
          <div class="profile-ident">
            <div class="profile-avatar">${escapeHtml(initials(username))}</div>
            <div>
              <span class="eyebrow">پروفایل عمومی</span>
              <h1 class="display-title mt-4">@${escapeHtml(username)}</h1>
              <p class="subtle-copy mt-3">این صفحه vitrine عمومی شماست؛ جایی برای نمایش فایل های واقعی، معرفی کوتاه و ارائه مستقیم محتوا به مشتری، همکار یا مخاطب نهایی.</p>
            </div>
          </div>
          <div class="info-tile profile-hero-meta">
            <p class="mt-0">نوع حساب: Public Portfolio</p>
            <p class="mt-2">فایل های عمومی: بر اساس محتوای واقعی شما</p>
            <p class="mt-2">آخرین به روزرسانی: بعد از اولین آپلود نمایش داده می شود</p>
          </div>
        </div>

        <div class="profile-grid mt-4">
          <div class="section-panel">
            <h2 class="mt-0">درباره این صفحه</h2>
            <p class="subtle-copy mt-3">هر فایلی که اینجا می بینید باید واقعا از طرف همین کاربر منتشر شده باشد. این صفحه برای معرفی شفاف، جمع وجور و حرفه ای فایل های عمومی طراحی شده است.</p>
            <div class="three-col mt-4">
              ${['نمونه کار', 'تحویل فایل', 'هویت عمومی'].map((item) => `<div class="info-tile">${escapeHtml(item)}</div>`).join('')}
            </div>
          </div>
          <div class="section-panel" style="background: linear-gradient(135deg, rgba(158, 243, 221, 0.1), rgba(255, 255, 255, 0.04), rgba(255, 176, 137, 0.1));">
            <h2 class="mt-0">ارتباط سریع</h2>
            <p class="subtle-copy mt-3">بازدیدکننده می تواند از اینجا برای دریافت نسخه جدید، همکاری یا درخواست فایل بیشتر اقدام کند.</p>
            <button class="btn-primary mt-4 js-profile-cta">درخواست همکاری یا فایل</button>
          </div>
        </div>

        <div class="file-public-grid mt-4 js-profile-files">
          ${profileFallbackFiles.map((file) => `<article class="profile-card"><h3 class="mt-0">${escapeHtml(file)}</h3><p class="muted mt-2">فایل عمومی آماده نمایش و دانلود</p></article>`).join('')}
        </div>
      </section>
    </main>
  `;
}

export function sharePage(token = 'demo') {
  return `
    <main class="page-shell py-hero fade-in js-share-root" data-token="${escapeHtml(token)}">
      <section class="share-grid">
        <div class="section-hero" style="padding: 1.6rem;">
          <span class="eyebrow">Secure Share Surface</span>
          <h1 class="display-title mt-4">تحویل فایل باید تمیز، امن و قابل اعتماد باشد.</h1>
          <p class="subtle-copy mt-4">این صفحه برای زمانی است که می خواهید فایل را با ظاهر حرفه ای، اطلاعات روشن و مسیر دانلود واضح به مشتری یا همکار تحویل دهید.</p>
          <div class="three-col mt-4 js-share-metrics">
            <div class="info-tile"><span class="muted">توکن</span><strong>${escapeHtml(token)}</strong></div>
            <div class="info-tile"><span class="muted">محدودیت</span><strong>25 دانلود</strong></div>
            <div class="info-tile"><span class="muted">وضعیت</span><strong>Active</strong></div>
          </div>
        </div>

        <div class="section-panel text-center js-share-card">
          <p class="caps-label mt-0">صفحه تحویل فایل</p>
          <h2 class="mt-2">در حال آماده سازی فایل اشتراکی</h2>
          <p class="subtle-copy mt-3">اگر این لینک واقعی باشد، صفحه به صورت خودکار فایل را پیدا می کند و پیش نمایش، دانلود و اطلاعات اصلی آن را نشان می دهد.</p>
          <div class="preview-hint mt-4" style="aspect-ratio: 1 / 1; max-width: 11rem; margin-inline: auto; color: #07111b; background: #fff;">QR</div>
          <div class="share-resolve-form js-share-actions">
            <button class="btn-primary js-share-download">دانلود امن فایل</button>
            <button class="btn-ghost js-share-request">درخواست نسخه جدید</button>
            <button class="btn-soft js-share-copy" type="button">کپی لینک صفحه</button>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderStaticPage(page, context = {}) {
  const user = context.user || null;
  switch (page) {
    case 'home':
      return { title: 'خانه', html: marketingShell({ activePath: '/', content: homePage() }) };
    case 'tour':
      return { title: 'تور محصول', html: marketingShell({ activePath: '/tour/', content: tourPage() }) };
    case 'solutions':
      return { title: 'راهکارها', html: marketingShell({ activePath: '/solutions/', content: solutionsPage() }) };
    case 'security':
      return { title: 'امنیت', html: marketingShell({ activePath: '/security/', content: securityPage() }) };
    case 'pricing':
      return { title: 'تعرفه ها', html: marketingShell({ activePath: '/pricing/', content: pricingPage() }) };
    case 'login':
      return { title: 'ورود', html: authPage('login') };
    case 'register':
      return { title: 'ثبت نام', html: authPage('register') };
    case 'dashboard':
      return { title: 'داشبورد', html: appShell({ activePath: '/dashboard/', user, content: dashboardPage() }) };
    case 'files':
      return { title: 'فایل ها', html: appShell({ activePath: '/files/', user, content: filesPage() }) };
    case 'workspaces':
      return { title: 'ورک اسپیس ها', html: appShell({ activePath: '/workspaces/', user, content: workspacesPage() }) };
    case 'team':
      return { title: 'اعضای تیم', html: appShell({ activePath: '/team/', user, content: teamPage() }) };
    case 'activity':
      return { title: 'اکتیویتی', html: appShell({ activePath: '/activity/', user, content: activityPage() }) };
    case 'settings':
      return { title: 'تنظیمات', html: appShell({ activePath: '/settings/', user, content: settingsPage() }) };
    case 'share':
      return { title: 'اشتراک فایل', html: sharePage(context.token) };
    case 'profile':
      return { title: `پروفایل ${context.username || 'nova'}`, html: profilePage(context.username || 'nova') };
    default:
      return { title: 'FVPlace Nova', html: marketingShell({ activePath: '/', content: homePage() }) };
  }
}
