# Bilingual AI Podcast Studio

[English](#english) | [فارسی](#persian)

---

## English

### 🚀 Overview

The **Bilingual AI Podcast Studio** is a cutting-edge, web-based application designed for effortless podcast creation. Leveraging the power of Google's Gemini AI, this studio allows users to generate complete podcast packages—including scripts, voice-overs, and promotional materials—in both English and Persian. The user interface is a stunning, immersive 3D-styled environment providing a seamless and intuitive experience.

This application runs entirely in the browser, using IndexedDB for local storage to save your podcast history securely on your own device.

### ✨ Features

-   **Bilingual Interface**: Fully functional in both English and Persian (Farsi) with a fluid language-switching toggle.
-   **AI-Powered Content Generation**:
    -   **Podcast Script**: Generates engaging scripts on any topic.
    -   **TTS Audio**: Creates natural-sounding narration using AI-powered text-to-speech in multiple voices and styles.
    -   **Cover Art**: Designs beautiful, high-quality cover art for your podcast.
    -   **Social Media Posts**: Automatically creates promotional captions for platforms like Instagram, Twitter/X, and Telegram.
-   **Advanced Customization**: Fine-tune your podcast with settings for duration, speaker tone, gender, speech speed, and more.
-   **Web-Sourced Content**: Optionally grounds the podcast content in up-to-date information from Google Search.
-   **Audio Mixing**: Control the volume of narration and add custom background music from a URL or an uploaded file.
-   **Transcript Editor**: Edit and save changes to the AI-generated transcript directly in the app.
-   **Persistent History**: All generated podcasts are saved locally in your browser for future access. The history is searchable and easy to navigate.
-   **Complete Download Package**: Download a ZIP file containing the WAV audio, TXT transcript, cover image, and social media posts.

### 🖼️ Screenshots

<p align="center">
  <img src="https://storage.googleapis.com/aistudio-hosting-project-prod.appspot.com/assets/images/6cdd556b-f417-4860-9d04-58a4369a2399" width="48%" alt="Settings Form in English">
  <img src="https://storage.googleapis.com/aistudio-hosting-project-prod.appspot.com/assets/images/7377f0a9-2d25-4523-a267-33a750b2b810" width="48%" alt="Settings Form in Persian">
</p>
<p align="center">
  <img src="https://storage.googleapis.com/aistudio-hosting-project-prod.appspot.com/assets/images/6c66cf17-5fa2-411a-a82f-87063c8ed31c" width="48%" alt="Results View 1">
  <img src="https://storage.googleapis.com/aistudio-hosting-project-prod.appspot.com/assets/images/6a56b26d-f060-4927-9571-700676b701bc" width="48%" alt="Results View 2">
</p>


### 🔧 Local Development

This is a static client-side application. No complex build steps are required.

1.  **Download Files**: Ensure you have all the project files (`index.html`, `index.tsx`, `App.tsx`, etc.) in a single folder.
2.  **API Key**: The application requires a Google AI API key. The code is set up to read this from an environment variable (`process.env.API_KEY`), which is handled by the hosting environment. For local testing, you might need to mock this or run it in an environment that supports it, like AI Studio.
3.  **Serve Locally**: You need a local web server to run the app. The easiest way is using `npx`:
    ```bash
    # Navigate to your project folder in the terminal
    cd path/to/your/project-folder

    # Run this command to start a local server
    npx serve
    ```
4.  **Open in Browser**: Open your web browser and go to the URL provided by the server (usually `http://localhost:3000`).

### ☁️ Cloudflare Deployment (Static Site)

The best way to deploy this application is using **Cloudflare Pages**, which is designed for high-performance static sites.

1.  **Sign Up for Cloudflare**: If you don't have an account, sign up at [dash.cloudflare.com](https://dash.cloudflare.com).
2.  **Prepare Your Files**: Put all your project files into a folder and either:
    -   Create a GitHub/GitLab repository and push your code to it. (Recommended)
    -   Prepare a `.zip` file of the folder.
3.  **Create a Pages Project**:
    -   In the Cloudflare dashboard, go to **Workers & Pages** > **Create application** > **Pages** > **Upload files** (or **Connect to Git**).
    -   Follow the instructions to upload your project folder or connect your repository.
4.  **Configure the Project**:
    -   **Project Name**: Choose a name for your project (e.g., `ai-podcast-studio`).
    -   **Build Settings**: Since this is a static project with no build step, you can leave the build command and build output directory fields blank. Cloudflare will simply serve the files from your root directory.
5.  **Set Environment Variable**:
    -   After the project is created, go to its settings: **Settings** > **Environment variables**.
    -   Add a **Production** environment variable:
        -   **Variable name**: `API_KEY`
        -   **Value**: Paste your Google AI API key here.
    -   This securely provides the API key to the application without exposing it in the frontend code.
6.  **Deploy**: Save the settings and trigger a deployment. Your application will be live on a `.pages.dev` subdomain.

---

## فارسی

### 🚀 معرفی کلی

**استودیوی پادکست هوش مصنوعی دوزبانه** یک اپلیکیشن وب پیشرفته است که برای ساخت آسان پادکست طراحی شده است. این استودیو با بهره‌گیری از قدرت هوش مصنوعی Gemini گوگل، به کاربران امکان می‌دهد تا پکیج‌های کامل پادکست - شامل متن، صداگذاری و مواد تبلیغاتی - را به دو زبان انگلیسی و فارسی تولید کنند. رابط کاربری آن یک محیط سه‌بعدی خیره‌کننده و همه‌جانبه است که تجربه‌ای روان و بصری را فراهم می‌کند.

این اپلیکیشن به طور کامل در مرورگر اجرا می‌شود و از IndexedDB برای ذخیره‌سازی محلی تاریخچه پادکست‌های شما به صورت امن بر روی دستگاه خودتان استفاده می‌کند.

### ✨ امکانات

-   **رابط کاربری دوزبانه**: عملکرد کامل به دو زبان انگلیسی و فارسی با قابلیت جابجایی سریع بین زبان‌ها.
-   **تولید محتوا با هوش مصنوعی**:
    -   **متن پادکست**: تولید متون جذاب در هر موضوعی.
    -   **صدای TTS**: ساخت روایت با صدای طبیعی با استفاده از تکنولوژی تبدیل متن به گفتار در صداها و سبک‌های مختلف.
    -   **طراحی کاور**: طراحی کاورهای زیبا و باکیفیت برای پادکست شما.
    -   **پست‌های شبکه‌های اجتماعی**: ایجاد خودکار کپشن‌های تبلیغاتی برای پلتفرم‌هایی مانند اینستاگرام، توییتر/X و تلگرام.
-   **شخصی‌سازی پیشرفته**: تنظیم دقیق پادکست با گزینه‌هایی برای مدت زمان، لحن گوینده، جنسیت، سرعت گفتار و موارد دیگر.
-   **محتوای مبتنی بر وب**: قابلیت تولید محتوای پادکست بر اساس اطلاعات به‌روز از جستجوی گوگل.
-   **میکسر صدا**: کنترل حجم صدای گوینده و افزودن موسیقی پس‌زمینه دلخواه از طریق URL یا فایل آپلود شده.
-   **ویرایشگر متن**: ویرایش و ذخیره تغییرات بر روی متن تولید شده توسط هوش مصنوعی به طور مستقیم در برنامه.
-   **تاریخچه دائمی**: تمام پادکست‌های تولید شده به صورت محلی در مرورگر شما برای دسترسی‌های بعدی ذخیره می‌شوند. تاریخچه قابل جستجو و پیمایش است.
-   **پکیج کامل دانلود**: دانلود یک فایل ZIP شامل فایل صوتی WAV، متن TXT، تصویر کاور و پست‌های شبکه‌های اجتماعی.

### 🖼️ تصاویر برنامه

<p align="center">
  <img src="https://storage.googleapis.com/aistudio-hosting-project-prod.appspot.com/assets/images/6cdd556b-f417-4860-9d04-58a4369a2399" width="48%" alt="فرم تنظیمات به زبان انگلیسی">
  <img src="https://storage.googleapis.com/aistudio-hosting-project-prod.appspot.com/assets/images/7377f0a9-2d25-4523-a267-33a750b2b810" width="48%" alt="فرم تنظیمات به زبان فارسی">
</p>
<p align="center">
  <img src="https://storage.googleapis.com/aistudio-hosting-project-prod.appspot.com/assets/images/6c66cf17-5fa2-411a-a82f-87063c8ed31c" width="48%" alt="نمای نتایج ۱">
  <img src="https://storage.googleapis.com/aistudio-hosting-project-prod.appspot.com/assets/images/6a56b26d-f060-4927-9571-700676b701bc" width="48%" alt="نمای نتایج ۲">
</p>


### 🔧 راه‌اندازی محلی (Local)

این یک اپلیکیشن استاتیک سمت کاربر است و به مراحل پیچیده ساخت (build) نیازی ندارد.

1.  **دانلود فایل‌ها**: اطمینان حاصل کنید که تمام فایل‌های پروژه (`index.html`، `index.tsx`، `App.tsx` و غیره) را در یک پوشه دارید.
2.  **کلید API**: برنامه به یک کلید API از Google AI نیاز دارد. کد طوری تنظیم شده است که این کلید را از یک متغیر محیطی (`process.env.API_KEY`) بخواند که توسط محیط میزبانی مدیریت می‌شود. برای تست محلی، ممکن است نیاز به شبیه‌سازی این متغیر داشته باشید یا آن را در محیطی مانند AI Studio اجرا کنید.
3.  **اجرای سرور محلی**: برای اجرای برنامه به یک وب سرور محلی نیاز دارید. ساده‌ترین راه استفاده از `npx` است:
    ```bash
    # در ترمینال به پوشه پروژه خود بروید
    cd path/to/your/project-folder

    # این دستور را برای شروع سرور محلی اجرا کنید
    npx serve
    ```
4.  **باز کردن در مرورگر**: مرورگر وب خود را باز کرده و به آدرس ارائه‌شده توسط سرور بروید (معمولاً `http://localhost:3000`).

### ☁️ استقرار در کلادفلر (سایت استاتیک)

بهترین روش برای استقرار این اپلیکیشن استفاده از **Cloudflare Pages** است که برای سایت‌های استاتیک با کارایی بالا طراحی شده است.

1.  **ثبت‌نام در کلادفلر**: اگر حساب کاربری ندارید، در [dash.cloudflare.com](https://dash.cloudflare.com) ثبت‌نام کنید.
2.  **آماده‌سازی فایل‌ها**: تمام فایل‌های پروژه خود را در یک پوشه قرار دهید و یکی از دو کار زیر را انجام دهید:
    -   یک مخزن GitHub/GitLab ایجاد کرده و کد خود را به آن push کنید. (توصیه می‌شود)
    -   یک فایل `.zip` از پوشه پروژه تهیه کنید.
3.  **ایجاد یک پروژه Pages**:
    -   در داشبورد کلادفلر، به **Workers & Pages** > **Create application** > **Pages** > **Upload files** (یا **Connect to Git**) بروید.
    -   دستورالعمل‌ها را برای آپلود پوشه پروژه یا اتصال به مخزن خود دنبال کنید.
4.  **پیکربندی پروژه**:
    -   **نام پروژه**: یک نام برای پروژه خود انتخاب کنید (مثلاً `ai-podcast-studio`).
    -   **تنظیمات ساخت (Build Settings)**: از آنجایی که این یک پروژه استاتیک بدون مرحله ساخت است، می‌توانید فیلدهای دستور ساخت و پوشه خروجی را خالی بگذارید. کلادفلر به سادگی فایل‌ها را از پوشه اصلی شما سرو می‌کند.
5.  **تنظیم متغیر محیطی**:
    -   پس از ایجاد پروژه، به تنظیمات آن بروید: **Settings** > **Environment variables**.
    -   یک متغیر محیطی **Production** اضافه کنید:
        -   **نام متغیر (Variable name)**: `API_KEY`
        -   **مقدار (Value)**: کلید Google AI API خود را در اینجا قرار دهید.
    -   این کار کلید API را به صورت امن در اختیار برنامه قرار می‌دهد بدون اینکه در کد فرانت‌اند نمایش داده شود.
6.  **استقرار (Deploy)**: تنظیمات را ذخیره کرده و یک استقرار را آغاز کنید. اپلیکیشن شما بر روی یک زیر دامنه `.pages.dev` فعال خواهد شد.
