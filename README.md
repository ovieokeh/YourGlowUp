# Face Glow Up

Achieve your optimal facial structure and looks max using the power of gamification, progress tracking, and an AI face coach.

## Features

- **AI Face Coach**: Personalized, science-backed analysis and plans. Users can:

  - Upload a photo and get a free "Face Symmetry Report" with actionable insights.
  - Receive a transformation plan with curated exercises and product/tool recommendations.
  - See an age/attractiveness estimate with confidence score and disclaimers.

- **Fast Value Onboarding**: Within 30 seconds of opening the app, users:

  - Try their first facial exercise immediately (no signup required).
  - Get a taste of gamification and visual feedback.
  - Are shown optional AI analysis and glow-up pledge features.

- **Progress Tracking**:

  - Visual scrubber comparing progress photos over time.
  - Daily/weekly stats (streaks, time invested, improvement scores).
  - Exportable "Glow Up Cards" for social sharing.

- **Gamification**:

  - Daily glow-up challenges.
  - XP points, streaks, badges, and levels.
  - Light leaderboard with opt-in privacy.

- **Social Proof & Shareability**:

  - Share your glow-up transformation card.
  - Exportable progress charts and montage videos.
  - Trending exercises based on user popularity.

- **Resources**:

  - Curated library of exercises, tutorials, and peer-reviewed articles.
  - Glow-up guides by goal (jawline, skin, symmetry, posture, etc).

- **Marketplace**:

  - Discover highly rated tools and products.
  - Transparent affiliate model with reviews and use-case alignment.
  - Only unlocked post-trust (after completing first AI analysis).

## Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **AI**: OpenAI API + optional vision model integration for face analysis
- **Backend & Storage**: Supabase & @react-native-async-storage/async-storage

## Backlog

### Flows

These are the flows that need to be implemented in the app.

- Every flow triggers either on first mount or from a previous flow. Every flow can be interrupted at any point. When explicitly interrupted, the flow will not trigger again unless the user resets the app data.

Every flow will be in one of these states:

- "not-started" the flow has not been triggered yet
- "in-progress" the flow is currently in progress (in case the user switches to a different app or screen)
- "completed" the flow has been completed successfully
- "interrupted" the flow has been interrupted by the user (in case the user clicks end)

### App flows

- Onboarding flow (option to skip as each screen has separate onboarding triggers)

- Triggers on first open or from "return to onbarding" notification pipeline

  - Splash screen (if user is logged in, redirect to Index screen, else continue to onboarding flow)
  - First welcome screen (welcome the user and one line social proof hook)
  - Second screen (show the user example images of before/after results including AI analysis, progress tracking, and gamification screenshots)
  - Third screen (try a 15-second glow-up exercise CTA with option to skip)
  - Fourth screen (post-exercise, get a face analysis self log CTA with option to skip)
  - - Opens flow for center alignment for consistency in progress tracking
  - Fifth screen (loading screen with 3 hooks cycling while the AI processes the image)
  - Sixth screen (show the user the result of the AI analysis along with a confidence score and disclaimers) (if quit at any point, add return-to-onboarding notification pipeline)
  - Seventh screen (Plan preview with "Save progress CTA" redirect to auth screen or quit app with sad face hook)

- First Homepage visit onboarding Flow (first-homepage-visit-onboarding-1)

  - First step (highlight the recommended exercises, talk about what they are and how to do them)
  - Second step (highlight the QuickStats card, talk about what it is and how to understand it)
  - Third step (make the user do the first exercise)

- First exercise onboarding Flow (new-exercise-1)

  - First step (highlight the exercise info-card, talk about the example image/gif, title, description, and links to research articles and social proofs)
  - Second step (highlight the controls and progress bar, talk about the start/stop button, and the timer)
  - Third step (highlight the start button and make the user do the first exercise ([
    - if the exercise requires a product, trigger the tools-onboarding-1
    - if the exercise requires a photo, trigger the photos-onboarding-1
      ]))
  - Fourth step (when complete, reward the user with +50 points and the "New Beginnings" badge)
  - Fifth step (show the user the progress tracking and gamification features)
  - Sixth step (make the user finalise the exercise and start the exercise-logs-1 flow)

- First exercise logs Flow (exercise-logs-1)

  - First step (explain the exercise logs, talk about what they are and how to understand them)
  - Second step (make the user switch to the self reports tab and trigger the self-reports-1 flow)

- Self-reports Flow (self-reports-1)

  - First step (explain the self-reports, talk about what they are and how to understand them)
  - Second step (make the user start a new self-report and trigger the new-self-reports-1 flow)

- New self-reports Flow (new-self-reports-1)

  - First step (explain the self-reports flow, talk about why it's useful, and stress the importance of being honest)
  - Second [fields.length] step (make the user fill each field while highlighting the fields and explaining them)
  - Final step (when complete, reward the user with +50 points and the "Reporter" badge, and [
    - if image was uploaded, start the progress-tracking-1 flow
    - if image was not uploaded, start the progress-stats-1 flow
      ])

- Progress tracking Flow (progress-tracking-1)

  - First step (explain the progress tracking, talk about what it is and how to understand it)
  - Second step (make the user switch to the progress-stats-1 flow)

- Progress stats Flow (progress-stats-1)

  - First step (explain the progress stats, talk about what they are and how to understand them)
  - Second step (show the user the progress tracking and gamification features)
  - Third step (make the user quit to the main screen )

- Tools onboarding Flow (tools-onboarding-1)
  - First step (explain the tools, talk about what they are and how to use them)

## Screens Required

- Onboarding screen

  - Splash screen DONE
  - First welcome screen (welcome the user and one line hook about the app) DONE
  - Second screen (ask the user to take a selfie or upload a photo with option to skip) DONE
  - Third screen (loading screen with 3 hooks cycling while the AI processes the image) DONE
  - Fourth screen (show the user the result of the AI analysis) (if quit at any point, add return-to-onboarding notification pipeline) DONE
  - Fifth screen (show the user the recommended exercises) DONE
  - Sixth screen (accept the recommendations and redirect to auth screen or quit app with sad face hook)

- Auth Screen

  - Create account screen (welcome the user and another one line hook about the app) DONE
  - Sign in screen (welcome the user and another one line hook about the app) DONE

- Index Screen

  - QuickStats card DONE
  - CompleteTodayExercises card (highlight the first uncompleted exercise in recommended exercises)
  - Recommended exercises card (rest of the recommended exercises) DONE
  - Products Upsell card (if any products are recommended in recommended exercises or AI analysis)

- Exercises screen

  - Recommended exercises carousel
  - Exercises list with filters (by category, by difficulty, by duration) PARTIALLY DONE (no filters yet)
    - Exercise info cards with thumbnail, difficulty level, duration, and bookmark option DONE

- Exercise screen

  - Exercise info card DONE
  - Exercise controls (start/stop button, progress bar, timer) DONE

- New self report screen

  - Self report fields (text, number, image) DONE
  - Submit button DONE

- Progress Logs screen

  - Type tab DONE
    - Self reports tab
    - Exercise logs tab
  - Self reports list with filters (by date, by score) PARTIALLY DONE (no filters yet)
    - Self report info cards DONE
    - Floating action button (add new self report) DONE
    - Example screenshot of list if no data is available yet
  - Exercise logs list with filters (by date, by score) PARTIALLY DONE (no filters yet)
    - Exercise info cards DONE
    - Floating action button (add new exercise log) DONE
    - Example screenshot of list if no data is available yet

- Progress Stats screen

  - Date range picker DONE
  - QuickStats card DONE
    - Example screenshot of card if no data is available yet
  - Stats charts (symmetry trend line chart, exercises breakdown pie chart) DONE
    - Example screenshot of chart if no data is available yet

- Progress tracking screen

  - Date range picker DONE
  - ProgressReview card with scrubber DONE
    - Example gifs of progress review scrubbing if no data is available yet
  - Badges DONE
    - Also show unearned badges in grayscale
  - Floating action button (add new self report) DONE
  - Glow-up card generator (exportable before/after image/video)
    - Choose photos, and metrics to include
    - Choose chart to include

- Settings screen

  - Type tab DONE
    - App settings
    - Account settings
  - App settings view
    - Theme selector DONE
    - Notifications settings (split by Challenges, Streaks, Weekly Summary)
      - Push notifications DONE
      - Email notifications
    - Language selector
  - Account settings view
    - Edit name DONE
    - Logout button DONE
    - Switch to Pro account (link to Stripe checkout)
    - Export/import data buttons DONE

- Marketplace screen
  - Explore tools view DONE
    - Tool list with filters (by tags)
      - Tool info card
        - with purchase button (link to affiliate link)
        - add to Owned button (redirect to add-to-owned view)

## Monetization

- Free tier

  - Limited access to all exercises and self reports features (only 1 exercise and self report per day)
  - Limited access to progress tracking features (only 1 week of history)
  - Limited access to chat features (only 10 messages per day) // post launch
  - Full access to gamification features
  - Full access to tools features

- Pro tier
  - Full access to all exercises and self reports features
  - Full access to progress tracking features (unlimited history)
  - Full access to chat features (unlimited messages per day) // post launch
  - Full access to gamification features
  - Full access to tools features

## Social Growth Engine

- **Lead Magnet**: Free AI face audit shared via TikTok, IG, Twitter.
- **Creator Partnerships**: Glow-up influencers use app + show transformation.
- **Built-In Virality**:

  - Glow-up challenge exports
  - Shareable progress cards/videos
  - Public badges + streak boards (opt-in)

- **User-Generated Content Loop**:

  - Prompt users to post #MyYourGlowUp weekly.
  - Gamify with monthly competitions.

TODO

- [ ] Add all the different onboarding flows
- [x] Update the Goals display design - GoalCard, featured image or animation, minimal title, activities, and description, cta
- [x] Update the Activities display design - ActivityCard, featured image or animation, minimal title, steps, and description, cta
- [ ] Update home tab, today's activities grouped by time and goal, personalised tip, community updates, badges & achievements, explore new goals
- [ ] Add Explore Goals screen
- [ ] Update Marketplace screen -> Explore (Goals, Resources)

1. Onboarding flow: welcome with social proof -> intent quiz -> show matching goals (option to create from scratch) -> auth -> redirect to today or goal creation screen

2. Today screen: quick stats hero (streak, activity trend, etc), today's activities list (can complete instantly or click into activity session view)

3. Goals screen: Hero with (my goals|explore) tabs, add goal button in the header top right, list of owned goals

3.1 Explore tabs list all public goals with search and category filters

3.2 Add/edit goal screen: Tabbed screen (basic info, settings)

3.3 Single goal screen: Tabbed screen (activities, community, stats) with edit button in header top right. Edit button navigates to the edit goal screen.

3.4 Activities tab: List of activities configured for this goal. Edit button on every activity to open the edit activity modal

3.5 Community: List of community updates like ('x just finished y activity', 'a shared their progress timelapse', etc). Plus button to open share modal (pick from predefined like activity log, timelapse, etc. No free input for now)

3.6 Stats: Detailed stats and charts about the community activity e.g demographics, most completed activity, total time spent in which activity, etc with filters

4 Progress: Tabbed screen (stats, photos, logs)

4.1 Stats tab: Detailed stats and charts about your activity e.g most completed activity, total time spent in which activity, etc with filters

4.2 Photos tab: Timelapse previews of each goal that has one

4.3 Logs: Raw logs with filters

5 Updates screen: Lighter version of goal community but for all goals at once. Can navigate deeper into specific goal communities

6 Settings screen: Tabbed screen (profile, app, help)

6.1 Profile: Set display name, photo, logout, export/import data

6.2 App: Theme, global notifications enabled, sound effects

6.3 Help: FAQ, contact button with deeplink to open default device mail app with preconfigured template, legal pages (privacy policy, terms of service, etc)
