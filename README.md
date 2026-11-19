# NERVE - Semester 3 Engineering Syllabus & Mobile Study Arena

A high-performance, mobile-first study progress tracker and social revision companion built with **HTML5, Tailwind CSS, Vanilla JavaScript, and Supabase / PostgreSQL**.

---

## 📱 Mobile-First 5-Tab Experience

1. 📚 **Syllabus**: All 8 Semester 3 engineering courses with modules, topics, 4-stage status cycle, 3-pass spaced repetition (`R1`, `R2`, `R3`), confidence stars, notes, and exam urgency countdowns.
2. ⏱️ **Focus Timer**: Dedicated 25/5 Pomodoro timer with animated circular countdown ring, topic auto-logger, and +100 XP rewards.
3. 🏆 **Ranks (Leaderboard)**:
   - **Portion Covered Race**: Compare what % of the syllabus your classmates have covered to motivate faster preparation before exams.
   - **Top 3 Scholars Podium**: Gold crown 👑, Silver medal 🥈, and Bronze medal 🥉 pedestals.
   - **Your Standing Banner**: Exact class rank (`#1`, `#2`, `#3`...) with personalized speed advice.
   - **Sort Filters**: Toggle between **Portion Covered %**, **XP Points**, and **Study Streak 🔥**.
   - **WhatsApp Challenge**: 1-tap button to challenge classmates in college WhatsApp groups.
4. 📊 **Stats & Timetable**:
   - **Unified Semester 3 Exam Timetable**: Chronological schedule of all 8 exams with live days-remaining alerts and preparation progress bars.
   - **Analytics**: Modules finished, revision passes, hours logged, and average confidence rating.
5. 👤 **Account & Sync**:
   - **Dual Cross-Device Sync Engine**: Automatic cloud restore via Supabase + 1-Tap Sync Code transfer without cloud setup.
   - **Blank Slate Reset**: "Reset to Empty Syllabus" to start fresh, and "Reload Semester 3 Syllabi" to restore the official curriculum.

---

## 🎯 Daily Study Target Goal

- **Interactive SVG Target Ring**: Configurable daily target (e.g. 4 topics/day).
- **Instant Momentum**: Live topic counter updates whenever you complete topics.
- **Goal Crushed Celebration**: +100 bonus XP, audio chime, and confetti when you hit your daily quota!

---

## 🔄 Cross-Device Login & Sync (How It Works)

### Method 1: Supabase Cloud Sync (Automatic)
1. Run the updated `supabase-schema.sql` in your Supabase SQL Editor.
2. Enter your **Project URL** and **Anon Key** in **Account &rarr; Supabase Cloud Database**.
3. Sign in on **Device A** &rarr; study and mark topics.
4. Open the website on **Device B** (phone/laptop) &rarr; sign in with the same email/password.
5. **All progress, syllabus notes, exam dates, XP, and streaks are automatically restored!**

### Method 2: 1-Tap Sync Code (Instant & Offline)
1. On Device A: Go to **Account &rarr; Copy 1-Tap Sync Code**.
2. On Device B: Go to **Account &rarr; Paste Sync Code from Previous Device**.
3. Your full state is restored in under 3 seconds with zero server configuration!

---

## 🚀 How to Run Locally

```powershell
Start-Process "C:\Users\DELL\.gemini\antigravity\scratch\study-syllabus-tracker\index.html"
```
*(Tip: On desktop, press `F12` and click the Device Toolbar icon `Ctrl+Shift+M` to test mobile screens!)*

---

## 📂 Project Structure

```
study-syllabus-tracker/
├── index.html           # Mobile layout, 5 tab screens, bottom sheets, timetable & goal ring
├── app.js               # Cross-device sync engine, leaderboard, timetable, daily goal, timer
├── styles.css           # Mobile shell, podium styling, flame pulse, urgent alerts
├── supabase-schema.sql  # Safe idempotent schema (student_profiles + RLS)
└── README.md            # Documentation
```
