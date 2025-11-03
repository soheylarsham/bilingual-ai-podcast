import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { Language } from '../types';

const translations = {
    en: {
        title: 'Bilingual AI Podcast Studio',
        topic: 'Podcast Topic',
        topicPlaceholder: 'e.g., The history of the Persian Empire',
        generate: 'Generate Podcast',
        generating: 'Generating Your Podcast...',
        generating_desc: 'Our AI is crafting your content. This may take a few moments.',
        duration: 'Duration (minutes)',
        tone: 'Speaker Tone',
        gender: 'Speaker Gender',
        male: 'Male',
        female: 'Female',
        speed: 'Speech Speed',
        slow: 'Slow',
        normal: 'Normal',
        fast: 'Fast',
        output: 'Output Format',
        audio: 'Audio',
        text: 'Text',
        sources: 'Sources',
        sourceUrls: 'Source URLs (comma-separated)',
        sourceFiles: 'Upload Files',
        sourceScope: 'Source Scope',
        internal: 'Internal Only',
        external: 'External Only',
        both: 'Both',
        verbalCitation: 'Verbal Citation in Audio',
        resultsTitle: 'Your Podcast is Ready!',
        playAudio: 'Play Audio',
        transcript: 'Transcript',
        references: 'References',
        socialMedia: 'Social Media Posts',
        download: 'Download',
        back: 'Create New Podcast',
        downloadPackage: 'Download Full Package',
        wavAudio: 'WAV Audio',
        txtTranscript: 'TXT Transcript',
        backgroundMusic: 'Background Music',
        musicStyle: 'Music Style',
        musicStylePlaceholder: 'e.g., Calm, lo-fi instrumental',
        audioMixer: 'Audio Mixer',
        narration: 'Narration',
        music: 'Music',
        history: 'History',
        searchHistory: 'Search history...',
        noHistory: 'No podcasts generated yet.',
        viewPodcast: 'View Podcast',
        backToSettings: 'Back to Settings',
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        transcriptUpdated: 'Transcript updated!',
        customMusicUrl: 'Custom Music URL',
        load: 'Load',
        customMusicFile: 'Or Upload Music File',
        generationMode: 'Generation Mode',
        fromTopic: 'From Topic',
        fromScript: 'From My Script',
        podcastTitleTopic: 'Podcast Title / Topic',
        podcastTitleTopicPlaceholder: 'A title for your podcast (for cover art, etc.)',
        provideScript: 'Provide Your Script',
        typeOrPaste: 'Type or paste your script here...',
        uploadScriptFile: 'Upload Script File (Text or Image)',
        scriptFile: 'Script File',
        thumbnailSource: 'Thumbnail Source',
        aiGenerated: 'AI Generated',
        uploadCustom: 'Upload Images',
        noThumbnail: 'No Thumbnail',
        fromUrl: 'From URL',
        addUrl: 'Add URL',
        addImageUrl: 'Add Image URL',
        customImages: 'Custom Images',
        imageSettings: 'Image Customization',
        settings: 'Settings',
        customizeImage: 'Customize Image',
        textOverlay: 'Text Overlay',
        font: 'Font',
        fontSize: 'Font Size',
        color: 'Color',
        effects: 'Effects',
        style: 'Style',
        style_Normal: 'Normal',
        style_Neon: 'Neon',
        style_Gradient: 'Gradient',
        style_Glass: 'Glass',
        apply: 'Apply Changes',
        share: 'Share',
        share_title: 'Share your Podcast',
        share_desc: 'Select the platforms where you want to publish your podcast.',
        publish: 'Publish',
        publishing: 'Publishing...',
        published: 'Published!',
        connections: 'Connections',
        connections_desc: 'Connect your accounts to automatically publish podcasts.',
        connect: 'Connect',
        disconnect: 'Disconnect',
        connected: 'Connected',
        notConnected: 'Not Connected',
        telegram: 'Telegram Bot',
        discord: 'Discord Bot',
        instagram: 'Instagram Bot',
        twitter: 'Twitter/X Bot',
        webhook: 'Webhook',
        wordpress: 'WordPress',
        workerUrl: 'Cloudflare Worker URL',
        workerUrlPlaceholder: 'https://my-worker.example.workers.dev',
        workerSecret: 'Worker Secret (Optional)',
        workerSecretPlaceholder: 'A secret key to secure your worker',
        guide: 'Setup Guide',
        guide_telegram: `**Goal**: Create a Cloudflare Worker that securely posts your podcast to a Telegram channel.

**Step 1: Get Telegram Credentials**
1.  **Create a Bot**: In Telegram, talk to [@BotFather](https://t.me/BotFather). Send \`/newbot\`, follow the prompts, and copy your **HTTP API Token**.
2.  **Get Chat ID**: Add your bot to your channel as an administrator. Then, send a message to the channel and forward it to **@get_id_bot** to get the channel's Chat ID (it starts with \`-100\`).

**Step 2: Deploy Cloudflare Worker**
1.  **Get Code**: [Download the Telegram Worker Script](/connections/telegram.js) and open it in a text editor.
2.  **Create Worker**: Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages**. Click **Create Application** -> **Create Worker**.
3.  **Deploy**: Give your worker a name (e.g., \`telegram-podcast-bot\`) and click **Deploy**.
4.  **Edit Code**: Click **Edit code**. Delete the existing code and paste the script you downloaded. Click **Save and Deploy**.
5.  **Add Secrets**: Go back to your worker's page, then **Settings** -> **Variables**. Add these **Encrypted** variables:
    *   \`BOT_TOKEN\`: Your Telegram Bot Token.
    *   \`CHAT_ID\`: Your channel's Chat ID.
    *   \`WORKER_SECRET\`: Create a strong, random password. This is for securing your worker.

**Step 3: Connect to this App**
1.  Copy your worker's URL (from the worker's main page).
2.  Paste it into the **Cloudflare Worker URL** field above.
3.  Paste the secret key you created into the **Worker Secret** field.
4.  Click **Connect**.`,
        guide_discord: `**Goal**: Create a Cloudflare Worker that sends your podcast details to a Discord channel via a Webhook.

**Step 1: Get Discord Webhook**
1.  In your Discord server, go to **Server Settings** → **Integrations** → **Webhooks**.
2.  Click **New Webhook**, give it a name, choose a channel, and **Copy Webhook URL**.

**Step 2: Deploy Cloudflare Worker**
1.  **Get Code**: [Download the Discord Worker Script](/connections/discord.js) and open it in a text editor.
2.  **Create Worker**: Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages**. Click **Create Application** -> **Create Worker**.
3.  **Deploy**: Give your worker a name (e.g., \`discord-podcast-bot\`) and click **Deploy**.
4.  **Edit Code**: Click **Edit code**. Paste the script you downloaded and click **Save and Deploy**.
5.  **Add Secrets**: Go to your worker's **Settings** -> **Variables**. Add these **Encrypted** variables:
    *   \`DISCORD_WEBHOOK_URL\`: The Webhook URL you copied from Discord.
    *   \`WORKER_SECRET\`: A strong, random password to secure your worker.

**Step 3: Connect to this App**
1.  Copy your worker's URL.
2.  Paste it into the **Cloudflare Worker URL** field above.
3.  Paste the secret key into the **Worker Secret** field.
4.  Click **Connect**.`,
        guide_instagram: `**Important Note**: Instagram's official API for automated posting is highly restrictive. Direct posting is not feasible for most users.

**Recommended Approach**:
1.  Use a third-party social media management tool that has official Instagram integration (e.g., Buffer, Hootsuite).
2.  Use an automation platform like **Zapier** or **Make.com (Integromat)**.
3.  In Zapier, create a new "Zap". The trigger should be a **Webhook**.
4.  Configure the **Webhook** connection in this app using the URL Zapier gives you.
5.  When a podcast is published, it will trigger the Zap, which can then be configured to create a post in your connected social media management tool.`,
        guide_twitter: `**Goal**: Deploy a worker to post your podcast announcement to your Twitter/X account.

**Step 1: Get Twitter API Keys**
1.  Apply for a [X Developer Account](https://developer.twitter.com/en/portal/dashboard). You will need **Elevated** access for a new project.
2.  Create a Project and an App inside it. In the App settings, set the permissions to **Read and Write**.
3.  In your App's "Keys and tokens" tab, generate and copy these four credentials:
    *   **API Key**
    *   **API Secret Key**
    *   **Access Token**
    *   **Access Token Secret**

**Step 2: Deploy Cloudflare Worker**
1.  **Get Code**: [Download the Twitter/X Worker Script](/connections/twitter.js) and open it.
2.  **Create & Deploy**: In your [Cloudflare Dashboard](https://dash.cloudflare.com/), create a new Worker and deploy it.
3.  **Edit Code**: Paste the downloaded script and **Save and Deploy**.
4.  **Add Secrets**: Go to your worker's **Settings** -> **Variables**. Add these five **Encrypted** variables:
    *   \`TWITTER_API_KEY\`
    *   \`TWITTER_API_SECRET\`
    *   \`TWITTER_ACCESS_TOKEN\`
    *   \`TWITTER_ACCESS_TOKEN_SECRET\`
    *   \`WORKER_SECRET\`: A strong, random password.

**Step 3: Connect to this App**
1.  Paste your worker's URL and the secret key into the fields above and click **Connect**.`,
        guide_webhook: `**Goal**: Send your podcast data from this app to any custom API or service you control.

**Step 1: Prepare Your Endpoint**
1.  Create an API endpoint on your server that accepts \`POST\` requests with a JSON body.
2.  Your endpoint will receive the full podcast data structure (transcript, URLs, etc.).

**Step 2: Deploy the Forwarding Worker (Optional, but Recommended)**
Using a worker adds a layer of security and logging.
1.  **Get Code**: [Download the Generic Webhook Worker Script](/connections/webhook.js).
2.  **Create & Deploy**: In your [Cloudflare Dashboard](https://dash.cloudflare.com/), create and deploy a new worker.
3.  **Edit & Deploy**: Paste the code and deploy.
4.  **Add Secrets**: Go to **Settings** -> **Variables** and add:
    *   \`DESTINATION_URL\`: The URL of your personal API endpoint.
    *   \`WORKER_SECRET\`: Your security key.

**Step 3: Connect to this App**
1.  Enter the Cloudflare Worker URL (or your direct API endpoint URL if not using a worker) above.
2.  Enter the secret key. The worker will add this as an \`Authorization: Bearer <secret>\` header on its request to your server.
3.  Click **Connect**.`,
        guide_wordpress: `**Goal**: Create a worker that automatically creates a new blog post on your WordPress site for each podcast.

**Step 1: Get WordPress Credentials**
1.  In your WordPress admin dashboard, go to **Users** → **Profile**.
2.  Scroll to "Application Passwords", enter a name for the new password (e.g., "Podcast Studio"), and click **Add New Application Password**.
3.  **Copy the generated password immediately.** It will not be shown again.

**Step 2: Deploy Cloudflare Worker**
1.  **Get Code**: [Download the WordPress Worker Script](/connections/wordpress.js) and copy it.
2.  **Create & Deploy**: In your [Cloudflare Dashboard](https://dash.cloudflare.com/), create and deploy a new worker.
3.  **Edit & Deploy**: Paste the code and deploy.
4.  **Add Secrets**: Go to your worker's **Settings** -> **Variables** and add these **Encrypted** variables:
    *   \`WP_URL\`: The full URL to your site (e.g., \`https://example.com\`).
    *   \`WP_USERNAME\`: Your WordPress admin username.
    *   \`WP_APP_PASSWORD\`: The application password you just generated.
    *   \`WORKER_SECRET\`: A strong, random password.

**Step 3: Connect to this App**
1.  Paste your worker's URL and the secret key into the fields above and click **Connect**.`,


        // Tone Options
        tone_Normal: 'Normal',
        tone_Friendly: 'Friendly',
        tone_Formal: 'Formal',
        tone_News_style: 'News-style',
        tone_Inspirational: 'Inspirational',
        tone_Sports_commentary: 'Sports commentary',
        tone_Poetic_Recitation: 'Poetic/Recitation',
        tone_Enthusiastic: 'Enthusiastic',
    },
    fa: {
        title: 'استودیوی پادکست هوش مصنوعی دوزبانه',
        topic: 'موضوع پادکست',
        topicPlaceholder: 'مثلا تاریخچه امپراتوری پارس',
        generate: 'تولید پادکست',
        generating: 'در حال تولید پادکست شما...',
        generating_desc: 'هوش مصنوعی ما در حال ساخت محتوای شماست. این ممکن است چند لحظه طول بکشد.',
        duration: 'مدت زمان (دقیقه)',
        tone: 'لحن گوینده',
        gender: 'جنسیت گوینده',
        male: 'مرد',
        female: 'زن',
        speed: 'سرعت گفتار',
        slow: 'آهسته',
        normal: 'معمولی',
        fast: 'سریع',
        output: 'فرمت خروجی',
        audio: 'صوتی',
        text: 'متنی',
        sources: 'منابع',
        sourceUrls: 'آدرس‌های URL منابع (جدا شده با ویرگول)',
        sourceFiles: 'آپلود فایل',
        sourceScope: 'محدوده منابع',
        internal: 'فقط داخلی',
        external: 'فقط خارجی',
        both: 'هر دو',
        verbalCitation: 'ذکر منابع در فایل صوتی',
        resultsTitle: 'پادکست شما آماده است!',
        playAudio: 'پخش فایل صوتی',
        transcript: 'متن کامل',
        references: 'منابع',
        socialMedia: 'پست‌های شبکه‌های اجتماعی',
        download: 'دانلود',
        back: 'ساخت پادکست جدید',
        downloadPackage: 'دانلود پکیج کامل',
        wavAudio: 'فایل صوتی WAV',
        txtTranscript: 'متن نوشتاری TXT',
        backgroundMusic: 'موسیقی پس‌زمینه',
        musicStyle: 'سبک موسیقی',
        musicStylePlaceholder: 'مثلا، بی‌کلام آرام و لو-فای',
        audioMixer: 'میکسر صدا',
        narration: 'گوینده',
        music: 'موسیقی',
        history: 'تاریخچه',
        searchHistory: 'جستجوی تاریخچه...',
        noHistory: 'هنوز پادکستی ساخته نشده است.',
        viewPodcast: 'مشاهده پادکست',
        backToSettings: 'بازگشت به تنظیمات',
        edit: 'ویرایش',
        save: 'ذخیره',
        cancel: 'لغو',
        transcriptUpdated: 'متن با موفقیت به‌روزرسانی شد!',
        customMusicUrl: 'آدرس URL موسیقی',
        load: 'بارگذاری',
        customMusicFile: 'یا فایل موسیقی آپلود کنید',
        generationMode: 'حالت تولید',
        fromTopic: 'از موضوع',
        fromScript: 'از متن شخصی',
        podcastTitleTopic: 'عنوان / موضوع پادکست',
        podcastTitleTopicPlaceholder: 'عنوانی برای پادکست شما (برای کاور و ...)',
        provideScript: 'متن خود را ارائه دهید',
        typeOrPaste: 'متن خود را اینجا تایپ یا الصاق کنید...',
        uploadScriptFile: 'آپلود فایل متن (متنی یا تصویری)',
        scriptFile: 'فایل متن',
        thumbnailSource: 'منبع تصویر کاور',
        aiGenerated: 'تولید با هوش مصنوعی',
        uploadCustom: 'آپلود تصاویر',
        noThumbnail: 'بدون تصویر',
        fromUrl: 'از URL',
        addUrl: 'افزودن URL',
        addImageUrl: 'افزودن آدرس تصویر',
        customImages: 'تصاویر سفارشی',
        imageSettings: 'تنظیمات تصویر',
        settings: 'تنظیمات',
        customizeImage: 'سفارشی‌سازی تصویر',
        textOverlay: 'متن روی تصویر',
        font: 'فونت',
        fontSize: 'اندازه فونت',
        color: 'رنگ',
        effects: 'افکت‌ها',
        style: 'سبک',
        style_Normal: 'معمولی',
        style_Neon: 'نئونی',
        style_Gradient: 'گرادیان',
        style_Glass: 'شیشه‌ای',
        apply: 'اعمال تغییرات',
        share: 'اشتراک‌گذاری',
        share_title: 'پادکست خود را به اشتراک بگذارید',
        share_desc: 'پلتفرم‌هایی را که می‌خواهید پادکست خود را در آنجا منتشر کنید، انتخاب نمایید.',
        publish: 'انتشار',
        publishing: 'در حال انتشار...',
        published: 'منتشر شد!',
        connections: 'اتصالات',
        connections_desc: 'حساب‌های خود را برای انتشار خودکار پادکست‌ها متصل کنید.',
        connect: 'اتصال',
        disconnect: 'قطع اتصال',
        connected: 'متصل شد',
        notConnected: 'متصل نیست',
        telegram: 'ربات تلگرام',
        discord: 'ربات دیسکورد',
        instagram: 'ربات اینستاگرام',
        twitter: 'ربات توییتر/X',
        webhook: 'وبهوک',
        wordpress: 'وردپرس',
        workerUrl: 'آدرس Cloudflare Worker',
        workerUrlPlaceholder: 'https://my-worker.example.workers.dev',
        workerSecret: 'کلید مخفی Worker (اختیاری)',
        workerSecretPlaceholder: 'یک کلید مخفی برای امن‌سازی worker',
        guide: 'راهنمای راه‌اندازی',
        guide_telegram: `**هدف**: ایجاد یک Cloudflare Worker که پادکست شما را به صورت امن در یک کانال تلگرام پست کند.

**مرحله ۱: دریافت اطلاعات تلگرام**
۱. **ساخت ربات**: در تلگرام، با [@BotFather](https://t.me/BotFather) صحبت کنید. دستور \`/newbot\` را ارسال کرده، دستورالعمل‌ها را دنبال کنید و **توکن HTTP API** خود را کپی کنید.
۲. **دریافت شناسه چت**: ربات خود را به عنوان مدیر به کانال خود اضافه کنید. سپس، یک پیام در کانال ارسال کرده و آن را به **@get_id_bot** فوروارد کنید تا شناسه چت کانال را دریافت کنید (با \`-100\` شروع می‌شود).

**مرحله ۲: استقرار Cloudflare Worker**
۱. **دریافت کد**: [اسکریپت Worker تلگرام را دانلود کنید](/connections/telegram.js) و آن را در یک ویرایشگر متن باز کنید.
۲. **ایجاد Worker**: به [داشبورد کلادفلر](https://dash.cloudflare.com/) -> **Workers & Pages** بروید. روی **Create Application** -> **Create Worker** کلیک کنید.
۳. **استقرار**: یک نام برای worker خود انتخاب کنید (مثلاً \`telegram-podcast-bot\`) و روی **Deploy** کلیک کنید.
۴. **ویرایش کد**: روی **Edit code** کلیک کنید. کد موجود را پاک کرده و اسکریپتی که دانلود کرده‌اید را جایگزین کنید. روی **Save and Deploy** کلیک کنید.
۵. **افزودن کلیدهای مخفی**: به صفحه worker خود بازگردید، سپس به **Settings** -> **Variables** بروید. این متغیرهای **Encrypted** را اضافه کنید:
    *   \`BOT_TOKEN\`: توکن ربات تلگرام شما.
    *   \`CHAT_ID\`: شناسه چت کانال شما.
    *   \`WORKER_SECRET\`: یک رمز عبور قوی و تصادفی ایجاد کنید. این برای امن‌سازی worker شماست.

**مرحله ۳: اتصال به این برنامه**
۱. آدرس URL worker خود را (از صفحه اصلی worker) کپی کنید.
۲. آن را در فیلد **Cloudflare Worker URL** بالا جای‌گذاری کنید.
۳. کلید مخفی که ایجاد کرده‌اید را در فیلد **Worker Secret** وارد کنید.
۴. روی **اتصال** کلیک کنید.`,
        guide_discord: `**هدف**: ایجاد یک Cloudflare Worker که جزئیات پادکست شما را از طریق یک Webhook به یک کانال دیسکورد ارسال کند.

**مرحله ۱: دریافت Webhook دیسکورد**
۱. در سرور دیسکورد خود، به **Server Settings** → **Integrations** → **Webhooks** بروید.
۲. روی **New Webhook** کلیک کنید، آن را نام‌گذاری کرده، یک کانال انتخاب کنید و **Copy Webhook URL** را بزنید.

**مرحله ۲: استقرار Cloudflare Worker**
۱. **دریافت کد**: [اسکریپت Worker دیسکورد را دانلود کنید](/connections/discord.js) و آن را در یک ویرایشگر متن باز کنید.
۲. **ایجاد Worker**: به [داشبورد کلادفلر](https://dash.cloudflare.com/) -> **Workers & Pages** بروید و یک **Worker** جدید ایجاد کنید.
۳. **استقرار**: یک نام برای worker خود انتخاب کرده و روی **Deploy** کلیک کنید.
۴. **ویرایش کد**: روی **Edit code** کلیک کنید، کد دانلود شده را جایگزین کرده و **Save and Deploy** را بزنید.
۵. **افزودن کلیدهای مخفی**: به **Settings** -> **Variables** در worker خود بروید و این متغیرهای **Encrypted** را اضافه کنید:
    *   \`DISCORD_WEBHOOK_URL\`: آدرس Webhook که از دیسکورد کپی کردید.
    *   \`WORKER_SECRET\`: یک رمز عبور قوی برای امن‌سازی worker.

**مرحله ۳: اتصال به این برنامه**
۱. آدرس URL worker خود را کپی کنید.
۲. آن را در فیلد **Cloudflare Worker URL** بالا وارد کنید.
۳. کلید مخفی را در فیلد **Worker Secret** وارد کنید.
۴. روی **اتصال** کلیک کنید.`,
        guide_instagram: `**نکته مهم**: API رسمی اینستاگرام برای ارسال پست خودکار بسیار محدودکننده است. ارسال مستقیم برای اکثر کاربران امکان‌پذیر نیست.

**رویکرد پیشنهادی**:
۱. از یک ابزار مدیریت شبکه‌های اجتماعی شخص ثالث که یکپارچگی رسمی با اینستاگرام دارد (مانند Buffer یا Hootsuite) استفاده کنید.
۲. از یک پلتفرم اتوماسیون مانند **Zapier** یا **Make.com (Integromat)** استفاده کنید.
۳. در Zapier، یک "Zap" جدید ایجاد کنید. تریگر آن باید یک **Webhook** باشد.
۴. اتصال **وبهوک** را در این برنامه با استفاده از آدرسی که Zapier به شما می‌دهد، پیکربندی کنید.
۵. هنگامی که یک پادکست منتشر می‌شود، Zap فعال شده و می‌تواند برای ایجاد یک پست در ابزار مدیریت شبکه‌های اجتماعی شما پیکربندی شود.`,
        guide_twitter: `**هدف**: استقرار یک worker برای ارسال اطلاعیه پادکست شما به حساب توییتر/X شما.

**مرحله ۱: دریافت کلیدهای API توییتر**
۱. برای یک [حساب توسعه‌دهنده X](https://developer.twitter.com/en/portal/dashboard) درخواست دهید. به دسترسی **Elevated** برای یک پروژه جدید نیاز خواهید داشت.
۲. یک پروژه و یک برنامه در آن ایجاد کنید. مجوزهای برنامه را روی **Read and Write** تنظیم کنید.
۳. در تب "Keys and tokens" برنامه خود، این چهار اعتبار را تولید و کپی کنید:
    *   **API Key**
    *   **API Secret Key**
    *   **Access Token**
    *   **Access Token Secret**

**مرحله ۲: استقرار Cloudflare Worker**
۱. **دریافت کد**: [اسکریپت Worker توییتر/X را دانلود کنید](/connections/twitter.js) و آن را باز کنید.
۲. **ایجاد و استقرار**: در [داشبورد کلادفلر](https://dash.cloudflare.com/)، یک Worker جدید ایجاد و مستقر کنید.
۳. **ویرایش کد**: اسکریپت دانلود شده را جایگزین کرده و **Save and Deploy** را بزنید.
۴. **افزودن کلیدهای مخفی**: به **Settings** -> **Variables** در worker خود بروید و این پنج متغیر **Encrypted** را اضافه کنید:
    *   \`TWITTER_API_KEY\`
    *   \`TWITTER_API_SECRET\`
    *   \`TWITTER_ACCESS_TOKEN\`
    *   \`TWITTER_ACCESS_TOKEN_SECRET\`
    *   \`WORKER_SECRET\`: یک رمز عبور قوی و تصادفی.

**مرحله ۳: اتصال به این برنامه**
۱. آدرس URL worker و کلید مخفی خود را در فیلدهای بالا وارد کرده و روی **اتصال** کلیک کنید.`,
        guide_webhook: `**هدف**: ارسال داده‌های پادکست شما از این برنامه به هر API یا سرویس سفارشی که کنترل آن را در دست دارید.

**مرحله ۱: آماده‌سازی Endpoint شما**
۱. یک نقطه پایانی (endpoint) API در سرور خود ایجاد کنید که درخواست‌های \`POST\` با بدنه JSON را بپذیرد.
۲. Endpoint شما ساختار کامل داده‌های پادکست (متن، URLها و غیره) را دریافت خواهد کرد.

**مرحله ۲: استقرار Worker واسط (اختیاری، اما توصیه می‌شود)**
استفاده از یک worker یک لایه امنیتی و لاگینگ اضافه می‌کند.
۱. **دریافت کد**: [اسکریپت Worker وب‌هوک عمومی را دانلود کنید](/connections/webhook.js).
۲. **ایجاد و استقرار**: در [داشبورد کلادفلر](https://dash.cloudflare.com/)، یک worker جدید ایجاد و مستقر کنید.
۳. **ویرایش و استقرار**: کد را جایگزین کرده و مستقر کنید.
۴. **افزودن کلیدهای مخفی**: به **Settings** -> **Variables** بروید و اضافه کنید:
    *   \`DESTINATION_URL\`: آدرس URL نقطه پایانی API شخصی شما.
    *   \`WORKER_SECRET\`: کلید امنیتی شما.

**مرحله ۳: اتصال به این برنامه**
۱. آدرس Cloudflare Worker (یا آدرس API مستقیم خود اگر از worker استفاده نمی‌کنید) را در بالا وارد کنید.
۲. کلید مخفی را وارد کنید. Worker این کلید را به عنوان هدر \`Authorization: Bearer <secret>\` در درخواست خود به سرور شما اضافه خواهد کرد.
۳. روی **اتصال** کلیک کنید.`,
        guide_wordpress: `**هدف**: ایجاد یک worker که به طور خودکار یک پست وبلاگ جدید در سایت وردپرس شما برای هر پادکست ایجاد کند.

**مرحله ۱: دریافت اطلاعات وردپرس**
۱. در پنل مدیریت وردپرس خود، به **کاربران** → **شناسنامه** بروید.
۲. به پایین صفحه بروید تا به "رمزهای عبور برنامه‌ها" برسید، یک نام برای رمز جدید وارد کنید (مثلاً "Podcast Studio") و روی **افزودن رمز عبور برنامه جدید** کلیک کنید.
۳. **رمز عبور تولید شده را فوراً کپی کنید.** این رمز دیگر نمایش داده نخواهد شد.

**مرحله ۲: استقرار Cloudflare Worker**
۱. **دریافت کد**: [اسکریپت Worker وردپرس را دانلود کنید](/connections/wordpress.js) و آن را کپی کنید.
۲. **ایجاد و استقرار**: در [داشبورد کلادفلر](https://dash.cloudflare.com/)، یک worker جدید ایجاد و مستقر کنید.
۳. **ویرایش و استقرار**: کد را جایگزین کرده و مستقر کنید.
۴. **افزودن کلیدهای مخفی**: به **Settings** -> **Variables** در worker خود بروید و این متغیرهای **Encrypted** را اضافه کنید:
    *   \`WP_URL\`: آدرس کامل سایت شما (مثلاً \`https://example.com\`).
    *   \`WP_USERNAME\`: نام کاربری مدیر وردپرس شما.
    *   \`WP_APP_PASSWORD\`: رمز عبور برنامه‌ای که به تازگی تولید کردید.
    *   \`WORKER_SECRET\`: یک رمز عبور قوی و تصادفی.

**مرحله ۳: اتصال به این برنامه**
۱. آدرس URL worker و کلید مخفی خود را در فیلدهای بالا وارد کرده و روی **اتصال** کلیک کنید.`,
        
        // Tone Options
        tone_Normal: 'معمولی',
        tone_Friendly: 'دوستانه',
        tone_Formal: 'رسمی',
        tone_News_style: 'خبری',
        tone_Inspirational: 'الهام‌بخش',
        tone_Sports_commentary: 'گزارش ورزشی',
        tone_Poetic_Recitation: 'شاعرانه/دکلمه',
        tone_Enthusiastic: 'پرشور و هیجان',
    }
};

export type TranslationKeys = keyof typeof translations.en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKeys) => string;
    dir: 'ltr' | 'rtl';
    fontClass: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const dir = language === 'fa' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        document.documentElement.dir = dir;
    }, [language]);

    const value: LanguageContextType = useMemo(() => ({
        language,
        setLanguage,
        t: (key: TranslationKeys) => translations[language][key] || key,
        dir: language === 'fa' ? 'rtl' : 'ltr',
        fontClass: language === 'fa' ? 'font-fa' : ''
    }), [language]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};