export const marketingNav = [
  { label: 'خانه', href: '/' },
  { label: 'تور محصول', href: '/tour/' },
  { label: 'راهکارها', href: '/solutions/' },
  { label: 'امنیت', href: '/security/' },
  { label: 'تعرفه ها', href: '/pricing/' },
];

export const appNav = [
  { label: 'داشبورد', href: '/dashboard/', short: 'Dashboard' },
  { label: 'فایل ها', href: '/files/', short: 'Files' },
  { label: 'ورک اسپیس ها', href: '/workspaces/', short: 'Spaces' },
  { label: 'اعضای تیم', href: '/team/', short: 'Team' },
  { label: 'اکتیویتی', href: '/activity/', short: 'Activity' },
  { label: 'تنظیمات', href: '/settings/', short: 'Settings' },
  { label: 'اشتراک ها', href: '/share/demo/', short: 'Share' },
  { label: 'پروفایل عمومی', href: '/profile/nova/', short: 'Profile' },
];

export const metrics = [
  { value: '1024MB', label: 'حداکثر حجم هر فایل' },
  { value: '20', label: 'آپلود همزمان' },
  { value: 'Live', label: 'جستجو و فعالیت زنده' },
];

export const pillars = [
  {
    title: 'فایل های حجیم، بدون آشوب',
    text: 'آپلودهای سنگین را با صف، پیش نمایش، کنترل و ساختار واضح داخل یک تجربه تمیز مدیریت کنید.',
  },
  {
    title: 'تحویل فایل با حس برند',
    text: 'صفحه های اشتراک و پروفایل عمومی فقط کاربردی نیستند؛ برای ارائه حرفه ای به مشتری طراحی شده اند.',
  },
  {
    title: 'پنل داخلی که واقعا محصول است',
    text: 'داشبورد، فایل ها، ورک اسپیس ها، تیم و تنظیمات، همه در یک زبان بصری منسجم قرار گرفته اند.',
  },
];

export const productSurfaces = [
  { name: 'Dashboard', title: 'داشبورد کنترل', desc: 'مرکز فرمان تیم، فعالیت و سلامت فایل ها' },
  { name: 'Files', title: 'هاب فایل', desc: 'آپلود، انتخاب چندفایلی، پیش نمایش و اشتراک' },
  { name: 'Share', title: 'تحویل حرفه ای', desc: 'لینک دانلود شیک و خوانا برای مشتری و همکار' },
  { name: 'Profile', title: 'هویت عمومی', desc: 'نمای عمومی فایل ها و دارایی های منتخب تیم' },
  { name: 'Team', title: 'اعضای تیم', desc: 'همکاری، نقش ها و جریان کار در یک نما' },
  { name: 'Settings', title: 'تنظیمات', desc: 'کنترل رفتار محصول، استایل و سیاست های استفاده' },
];

export const story = [
  'ورود به یک هوم با هویت مشخص و مسیرهای روشن',
  'رفتن به پنل داخلی بدون افت کیفیت بصری',
  'مدیریت فایل با تجربه ای جدی، خوانا و سریع',
  'اشتراک گذاری و نمایش عمومی با کیفیت ارائه حرفه ای',
];

export const dashboardFallback = {
  stats: [
    { label: 'فایل فعال', value: '1,284' },
    { label: 'لینک اشتراک', value: '96' },
    { label: 'اعضای واقعی', value: '0' },
    { label: 'آپلود امروز', value: '0' },
  ],
  activities: [
    'ویدیوی کمپین به فضای تیم آپلود شد',
    'لینک اشتراک برای فایل معرفی برند ساخته شد',
    'پوشه قراردادهای مشتری بازآرایی شد',
    'عضو جدید به workspace محصول دعوت شد',
  ],
  files: ['Brand-System.pdf', 'Q2 Campaign Assets', 'Launch-Trailer.mp4', 'Roadmap Board'],
};

export const workspacesFallback = [
  { name: 'Nova Product', role: 'Owner', members: 8, storage: '4.2 GB' },
  { name: 'Client Delivery', role: 'Admin', members: 14, storage: '7.9 GB' },
  { name: 'Studio Vault', role: 'Editor', members: 5, storage: '2.1 GB' },
];

export const teamFallback = [];

export const activityFallback = [
  { action: 'آپلود', title: 'Launch-Film-v7.mp4', time: '2 دقیقه پیش', accent: 'text-brand' },
  { action: 'اشتراک', title: 'Brand-System.pdf', time: '9 دقیقه پیش', accent: 'text-warning' },
  { action: 'جابجایی', title: 'Client Assets / Final', time: '26 دقیقه پیش', accent: 'text-violet' },
  { action: 'دعوت عضو', title: 'Sara Rahimi', time: '1 ساعت پیش', accent: 'text-danger' },
];

export const tourSteps = [
  { title: 'Landing با پیام واضح', body: 'کاربر به جای یک صفحه خالی، یک هوم قدرتمند می بیند که محصول، مسیرها و مزیت ها را شفاف معرفی می کند.' },
  { title: 'Dashboard با حس اتاق فرمان', body: 'ورود به اپ به یک پنل جدی منتهی می شود؛ داده، کارت، فعالیت و مسیر عملیات همگی حاضر هستند.' },
  { title: 'File Hub با مدیریت واقعی', body: 'آپلود، جستجو، پیش نمایش، ساخت پوشه، ساخت لینک و کنترل صف آپلود در یک سطح حرفه ای جمع شده اند.' },
  { title: 'Share و Profile برای بیرون از اپ', body: 'وقتی فایل را با کسی بیرون از تیم به اشتراک می گذارید، تجربه همچنان برنددار، تمیز و قابل اتکاست.' },
];

export const solutions = [
  {
    title: 'استودیوهای خلاق و تولید محتوا',
    text: 'برای تحویل فایل های ویدیویی، آرشیو پروژه، بازخورد مشتری و ساخت لینک های دانلود شیک.',
    points: ['آپلودهای حجیم', 'پیش نمایش فایل', 'تحویل برندپذیر'],
  },
  {
    title: 'تیم های محصول و نرم افزار',
    text: 'برای مستندات، فایل های طراحی، خروجی build، همکاری تیمی و ردیابی تغییرات روزمره.',
    points: ['جستجو و پوشه بندی', 'فعالیت تیمی', 'مدیریت نقش ها'],
  },
  {
    title: 'شرکت های خدماتی و آژانس ها',
    text: 'برای مدیریت دارایی های مشتری، قراردادها، فایل های تحویلی و پورتال حرفه ای اشتراک.',
    points: ['پروفایل عمومی', 'اشتراک امن', 'محدودیت دانلود'],
  },
];

export const securityLayers = [
  'استفاده از JWT برای نشست های کاربری و API خصوصی',
  'لینک های اشتراک با انقضا، محدودیت دانلود و امکان گسترش برای رمز',
  'فیلتر نوع فایل برای جلوگیری از برخی فرمت های پرخطر',
  'ذخیره سازی محلی self-hosted بدون وابستگی runtime به سرویس خارجی',
];

export const pricingPlans = [
  {
    name: 'Starter',
    price: 'رایگان',
    caption: 'برای تست محصول و شروع سریع',
    points: ['یک workspace', 'آپلود تا 1024MB', 'پیش نمایش و لینک اشتراک'],
    cta: '/register/',
  },
  {
    name: 'Studio',
    price: 'محبوب تیم ها',
    caption: 'برای تیم هایی که تحویل فایل و همکاری برایشان مهم است',
    points: ['چند workspace', 'فعالیت تیمی', 'پروفایل عمومی و صفحه اشتراک حرفه ای'],
    cta: '/dashboard/',
  },
  {
    name: 'Enterprise',
    price: 'سفارشی',
    caption: 'برای استقرار داخلی و سیاست های امنیتی سخت گیرانه',
    points: ['استقرار self-hosted', 'سفارشی سازی مسیرها', 'پشتیبانی از فرایندهای داخلی'],
    cta: '/security/',
  },
];

export const notificationsSeed = [
  'آخرین فعالیت ها از لاگ واقعی سیستم خوانده می شوند.',
  'سقف آپلود پروژه روی 1024MB هماهنگ شده است',
  'صفحات معرفی، امنیت و تعرفه در نسخه وانیلا در دسترس هستند',
];

export const commandItems = [
  { label: 'آپلود فایل جدید', href: '/files/' },
  { label: 'ساخت پوشه جدید', href: '/files/' },
  { label: 'مرور داشبورد', href: '/dashboard/' },
  { label: 'صفحه امنیت', href: '/security/' },
  { label: 'تعرفه ها', href: '/pricing/' },
];

export const fileManagerFallback = {
  files: [
    { _id: 'demo-1', name: 'Brand-System.pdf', type: 'file', mimeType: 'application/pdf', size: 2400000, updatedAtLabel: 'امروز' },
    { _id: 'demo-2', name: 'Launch-Trailer.mp4', type: 'file', mimeType: 'video/mp4', size: 84000000, updatedAtLabel: '8 دقیقه پیش' },
    { _id: 'demo-3', name: 'Synthwave-Cover.png', type: 'file', mimeType: 'image/png', size: 6700000, updatedAtLabel: 'امروز' },
    { _id: 'demo-4', name: 'api-client.ts', type: 'file', mimeType: 'text/typescript', size: 18000, updatedAtLabel: 'دیروز' },
    { _id: 'demo-5', name: 'Product Assets', type: 'folder', mimeType: 'folder', size: 0, updatedAtLabel: 'امروز' },
    { _id: 'demo-6', name: 'Weekly-Podcast.mp3', type: 'file', mimeType: 'audio/mpeg', size: 15200000, updatedAtLabel: '2 روز پیش' },
    { _id: 'demo-7', name: 'Client-Proposal.docx', type: 'file', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 560000, updatedAtLabel: 'امروز' },
  ],
  insights: [
    { label: 'سقف هر فایل', value: '1024MB' },
    { label: 'آپلود همزمان', value: '20 فایل' },
    { label: 'لینک اشتراک', value: 'QR + محدودیت' },
  ],
  smartCollections: [
    { label: 'طراحی', count: 38 },
    { label: 'ویدیو', count: 12 },
    { label: 'اسناد', count: 146 },
    { label: 'کد و فنی', count: 24 },
  ],
  quickPanels: [
    { title: 'آپلود حجیم', copy: 'پشتیبانی یکپارچه تا سقف 1024MB برای هر فایل' },
    { title: 'مرتب سازی هوشمند', copy: 'جستجو، پوشه بندی، پیش نمایش و عملیات سریع روی فایل ها' },
    { title: 'تحویل حرفه ای', copy: 'از همین صفحه تا ساخت لینک اشتراک و پروفایل عمومی' },
  ],
  breadcrumbs: ['Workspace اصلی', 'Brand Assets', 'Deliverables'],
};

export const profileFallbackFiles = [
  'Portfolio-Deck.pdf',
  'Brand-Reel.mp4',
  'Press-Kit.zip',
  'Case-Study.docx',
];
