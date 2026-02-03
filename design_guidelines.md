# Stress Congress 2026 - Design Guidelines

## Brand Identity

**Purpose**: Professional event platform for a real medical conference, supporting both attendees and staff with distinct experiences.

**Aesthetic Direction**: **Bold/Editorial Conference Style**
- High-energy, premium event atmosphere
- Medical professionalism meets modern tech
- Vibrant gradients suggesting innovation and forward-thinking
- Clear information hierarchy (editorial influence)
- Celebratory moments that feel special

**Memorable Element**: The dramatic full-screen check-in celebration with confetti and logo animation - attendees will remember this "welcome moment" as their official entry to the event.

## Navigation Architecture

**Root Navigation**: Drawer (Side Panel)

Role-based menus (same app, different content):

**Attendee Drawer**:
- Home
- Agenda
- Speakers
- My QR Code
- Notifications
- Profile
- Logout

**Staff Drawer**:
- Dashboard
- Scan QR
- Attendee Search
- Stats
- Notifications
- Logout

## Screen Specifications

### Auth Screens

**Login Screen** (Stack-Only)
- Header: None (full screen)
- Content: Centered card with gradient background
  - Event logo at top
  - Email input field
  - "Continue" button
  - Whitelist rejection message appears below if email not found
  - Safe area insets: top: insets.top + 60, bottom: insets.bottom + 40
- Components: TextInput, Button, Alert message

### Attendee Screens

**Home Screen**
- Header: Transparent, profile avatar (right)
- Content: Scrollable
  - Welcome card with gradient background, user name
  - "Days until event" countdown card
  - Quick action cards (View Agenda, My QR Code)
  - Recent notifications preview
  - Safe area insets: top: headerHeight + Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: Countdown timer, action cards, notification preview list

**Agenda Screen**
- Header: Default with "Agenda" title, filter icon (right)
- Content: List (FlatList)
  - Sticky date headers
  - Session cards with time, title, speaker, location
  - "Add to Schedule" heart icon
  - Empty state: "Schedule coming soon" illustration
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: Session cards, filter modal, add-to-schedule button

**Speakers Screen**
- Header: Default with "Speakers" title, search bar
- Content: Grid (FlatList, 2 columns)
  - Speaker cards: photo, name, title
  - Tappable to view details modal
  - Empty state: "Speakers announced soon" illustration
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: Speaker cards, detail modal

**My QR Code Screen**
- Header: Default with "My QR Code" title
- Content: Centered, non-scrollable
  - Large QR code display (300x300)
  - User name below
  - "Show this at check-in" instruction
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: QR code component, instruction text

**Profile Screen**
- Header: Default with "Profile" title
- Content: Scrollable form
  - Avatar with edit button
  - Name, email (read-only)
  - Toggle switches for notification preferences
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: Form fields, toggle switches

### Staff Screens

**Dashboard Screen**
- Header: Default with "Dashboard" title, refresh icon (right)
- Content: Scrollable
  - Stats cards (Total Registered, Checked In, Pending)
  - Live check-in feed (last 10 check-ins)
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: Stat cards, live feed list

**Scan QR Screen**
- Header: Transparent with close button (left)
- Content: Camera viewfinder (full screen)
  - Scanning frame overlay
  - "Scan attendee QR code" instruction at bottom
  - Safe area insets: top: insets.top + 20, bottom: insets.bottom + 20
- Components: Camera view, scanning overlay
- Modal: Check-in success celebration (full screen)
  - Confetti animation
  - Animated event logo
  - "Welcome to Stress Congress 2026" message
  - Attendee name
  - Dismiss automatically after 3 seconds

**Attendee Search Screen**
- Header: Default with search bar
- Content: List (FlatList)
  - Attendee cards: name, email, check-in status badge
  - Tappable to view details/manual check-in
  - Empty state: "No attendees found" illustration
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: Search bar, attendee cards, status badges

**Stats Screen**
- Header: Default with "Statistics" title
- Content: Scrollable
  - Check-in percentage chart
  - Role breakdown (Attendee vs Staff counts)
  - Hourly check-in graph
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: Charts, stat cards

### Shared Screens

**Notifications Screen**
- Header: Default with "Notifications" title
- Content: List (FlatList)
  - Notification cards: icon, title, message, timestamp
  - Unread indicator
  - Empty state: "No notifications yet" illustration
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: Notification cards

## Color Palette

**Primary**: Deep Medical Blue gradient (#1E40AF → #3B82F6)
**Accent**: Energetic Coral (#FF6B6B) - for CTAs and important actions
**Success**: Medical Green (#10B981)
**Warning**: Amber (#F59E0B)
**Background**: Light Gray (#F9FAFB)
**Surface**: White (#FFFFFF)
**Text Primary**: Dark Blue (#1F2937)
**Text Secondary**: Gray (#6B7280)
**Border**: Light Gray (#E5E7EB)

## Typography

**Font**: System fonts (SF Pro for iOS, Roboto for Android)
- **Display**: Bold, 28pt - Screen titles, welcome messages
- **Title**: Semibold, 20pt - Card headers, section titles
- **Headline**: Semibold, 17pt - List item titles
- **Body**: Regular, 15pt - Descriptions, body text
- **Caption**: Regular, 13pt - Timestamps, hints

## Visual Design

- Use gradient backgrounds on hero cards (primary color gradient)
- Card shadows: shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 8
- Floating action button (Scan QR): shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
- Button press states: opacity 0.8
- Smooth transitions between screens (300ms)
- Loading states: skeleton screens with shimmer animation
- Icons: Use Feather icons from @expo/vector-icons

## Assets to Generate

1. **icon.png** - Event logo with "SC 2026" monogram, blue gradient background - App icon
2. **splash-icon.png** - Full event logo "Stress Congress 2026" with medical cross - Splash screen
3. **empty-agenda.png** - Calendar illustration with "Schedule coming soon" - Agenda empty state
4. **empty-speakers.png** - Podium illustration with "Speakers announced soon" - Speakers empty state
5. **empty-notifications.png** - Bell illustration with "No notifications yet" - Notifications empty state
6. **empty-search.png** - Magnifying glass with "No attendees found" - Search empty state
7. **celebration-logo.png** - Large animated event logo for check-in success - Check-in celebration modal
8. **default-avatar.png** - Medical professional avatar silhouette - User profile placeholder

All illustrations should use the primary blue color scheme with coral accents, simple and professional style suitable for medical conference.