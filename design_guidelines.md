# YKS Social Media App - Design Guidelines

## Brand Identity

**Purpose**: A social platform for YKS (Turkish university entrance exam) students to share and discover exam questions. No videos—pure focus on question-solving.

**Aesthetic**: Dark, focused, motivating. Think "midnight study session with neon highlighters." The app should feel like a productive sanctuary, not a distracting feed. Neon accents cut through the darkness to highlight key actions.

**Memorable Element**: The "YKS Reels" vertical question feed—TikTok's addictive swipe, but for exam questions instead of entertainment.

## Navigation Architecture

**Root Navigation**: Tab Bar (5 tabs)

**Screen List**:
1. **Ana Sayfa (Home)** - Dashboard with quick actions and recent questions
2. **YKS Reels** - Vertical scrolling question feed (core feature)
3. **Soru Ekle (Add Question)** - Modal form to post questions
4. **Görevlerim (My Tasks)** - Study tasks and goals
5. **Kütüphane (Library)** - Saved questions, organized by subject
6. **Dersler (Subjects)** - Browse by TYT/AYT and subject tags
7. **Topluluk (Community)** - Telegram-like messaging and groups
8. **Profil (Profile)** - User profile with stats and badges

## Screen-by-Screen Specifications

### Ana Sayfa (Home)
- **Header**: Transparent, greeting text "İyi Günler", notifications icon (right)
- **Layout**: Scrollable
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl
- **Components**:
  - Large card: "Soru Sor" with icon
  - Large card: "YKS Reels" entry point
  - "Son Sorular" section with horizontal scrollable question cards
  - Each section has "Tümünü Gör" button (top right)

### YKS Reels (Core Feature)
- **Header**: None (immersive)
- **Layout**: Vertical swipeable full-screen cards (one question per screen)
- **Safe Area**: Top: insets.top + Spacing.md, Bottom: insets.bottom + Spacing.md
- **Components per card**:
  - Question image or text (centered)
  - Subject tag chip (top-left, e.g., "#TYT Matematik")
  - Right-side floating actions: Like (heart icon), Comment (chat icon), Save (bookmark icon), Share
  - Bottom: "Çözümü Gör" button (primary accent)
- **Interaction**: Swipe up/down to navigate questions

### Soru Ekle (Add Question)
- **Type**: Modal (presented over tab bar)
- **Header**: "Yeni Soru", Cancel (left), Paylaş (right)
- **Layout**: Scrollable form
- **Safe Area**: Top: insets.top + Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Components**:
  - Image upload area
  - Question text input
  - Subject tags selector (chips)
  - TYT/AYT toggle
  - Submit button at bottom

### Görevlerim (My Tasks)
- **Header**: Default, "Görevlerim"
- **Layout**: Scrollable list
- **Safe Area**: Top: Spacing.xl, Bottom: tabBarHeight + Spacing.xl
- **Components**:
  - Task cards (checkbox, title, progress bar)
  - Add task button (floating, bottom-right)
- **Empty State**: Show empty-tasks.png illustration

### Kütüphane (Library)
- **Header**: Default, "Kütüphane", Filter icon (right)
- **Layout**: Scrollable grid (2 columns)
- **Safe Area**: Top: Spacing.xl, Bottom: tabBarHeight + Spacing.xl
- **Components**:
  - Saved question cards with subject tag
  - Sort by subject filter
- **Empty State**: Show empty-library.png illustration

### Dersler (Subjects)
- **Header**: Default, "Dersler"
- **Layout**: Scrollable
- **Safe Area**: Top: Spacing.xl, Bottom: tabBarHeight + Spacing.xl
- **Components**:
  - TYT/AYT segment control
  - Subject cards grid (icon + subject name)

### Topluluk (Community)
- **Header**: Default, "Topluluk", Search (right)
- **Layout**: Scrollable list
- **Safe Area**: Top: Spacing.xl, Bottom: tabBarHeight + Spacing.xl
- **Components**:
  - DM conversations list
  - Group chats list
  - Join group button
  - Each item: avatar, name, last message preview

### Profil (Profile)
- **Header**: Transparent, Settings icon (right)
- **Layout**: Scrollable
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl
- **Components**:
  - Avatar, name, bio
  - Stats row: Takipçi, Takip Edilen, Soru Sayısı
  - Badges section (horizontal scroll)
  - Tabs: Sorularım, Kaydedilenler
  - List of questions below

## Color Palette

- **Background**: #0A0A0F (almost black with slight blue tint)
- **Surface**: #1A1A2E (dark navy for cards)
- **Primary**: #00E5FF (neon cyan blue)
- **Secondary**: #B620E0 (neon purple)
- **Accent**: #FF006E (neon pink/red)
- **Text Primary**: #FFFFFF
- **Text Secondary**: #A0A0B0
- **Success**: #00E676
- **Border**: #2E2E42 (subtle dividers)

## Typography

- **Font**: Nunito (via Google Fonts) for friendly, student-approachable feel
- **Type Scale**:
  - Heading 1: 28pt, Bold
  - Heading 2: 22pt, SemiBold
  - Body: 16pt, Regular
  - Caption: 14pt, Regular
  - Small: 12pt, Regular

## Assets to Generate

1. **icon.png** - App icon with stylized "YKS" letters and neon gradient (cyan to purple)
2. **splash-icon.png** - Same as app icon for launch screen
3. **empty-tasks.png** - Illustration of empty checklist with neon accents, used in Görevlerim empty state
4. **empty-library.png** - Illustration of empty bookshelf with neon books, used in Kütüphane empty state
5. **question-placeholder.png** - Generic question card graphic for loading states, used in YKS Reels and question lists
6. **default-avatar.png** - Neon-outlined circular avatar for users without profile pictures, used in Profil and Topluluk
7. **badge-active.png** - "Aktif Öğrenci" badge icon (neon star), used in profile badges section
8. **badge-top-solver.png** - "Derece Adayı" badge icon (neon trophy), used in profile badges section