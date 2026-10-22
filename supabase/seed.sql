-- Sample data for local testing and grading.
-- Run after schema.sql, in the Supabase SQL Editor.
--
-- Covers every category at least once, several already-closed surveys so
-- the "Past" tab and its category filter are testable, and one survey with
-- no deadline at all, so "Runs indefinitely" has something to show.

do $$
begin
  -- Active, soonest-ending first (these three populate "Ending soon").
  perform create_survey(
    p_title := 'Let''s Plan the Next Team Event Together',
    p_category := 'Team Activities',
    p_description := 'We want to create team activities that everyone will enjoy – share your preferences and ideas in our survey to help us plan better experiences together.',
    p_deadline := now() + interval '1 day',
    p_questions := '[
      {"text": "Which date would work best for you?", "allow_multiple": true,
       "options": ["19.09.2025, Friday", "10.10.2025, Friday", "11.10.2025, Saturday", "31.10.2025, Friday"]},
      {"text": "Choose the activities you prefer", "allow_multiple": true,
       "options": ["Outdoor adventure like kayaking", "Office Costume Party", "Bowling, mini-golf, volleyball", "Beach party, Music & cocktails", "Escape room"]},
      {"text": "What''s most important to you in a team event?", "allow_multiple": false,
       "options": ["Team bonding", "Food and drinks", "Trying something new", "Keeping it low-key and stress-free"]},
      {"text": "How long would you prefer the event to last?", "allow_multiple": false,
       "options": ["Half a day", "Full day", "Evening only"]}
    ]'::jsonb
  );

  perform create_survey(
    p_title := 'Fit & Wellness Check-In',
    p_category := 'Health & Wellness',
    p_description := 'Take a minute to share your preferences so we can make this a great experience for everyone.',
    p_deadline := now() + interval '2 days',
    p_questions := '[
      {"text": "How often do you exercise per week?", "allow_multiple": false,
       "options": ["0", "1-2", "3-4", "5+"]},
      {"text": "Which wellness offer would you use?", "allow_multiple": true,
       "options": ["Yoga sessions", "Standing desks", "Walking meetings", "Meditation room"]}
    ]'::jsonb
  );

  perform create_survey(
    p_title := 'Gaming Habits and Favorite Games',
    p_category := 'Gaming & Entertainment',
    p_description := 'Your input matters — let us know what you think so we can shape this together.',
    p_deadline := now() + interval '3 days',
    p_questions := '[
      {"text": "Which platform do you play on most?", "allow_multiple": true,
       "options": ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"]}
    ]'::jsonb
  );

  -- Further active surveys, outside the "ending soon" window.
  perform create_survey(
    p_title := 'Lunch and Learn Topics',
    p_category := 'Education & Learning',
    p_description := 'Pick the topics you would actually show up for.',
    p_deadline := now() + interval '7 days',
    p_questions := '[
      {"text": "Which topic should we cover next?", "allow_multiple": false,
       "options": ["Public speaking", "Time management", "New tech trends", "Design basics"]}
    ]'::jsonb
  );

  perform create_survey(
    p_title := 'Tools We Should Try This Quarter',
    p_category := 'Technology & Innovation',
    p_description := 'Help us prioritize which tools are worth a pilot.',
    p_deadline := now() + interval '10 days',
    p_questions := '[
      {"text": "Which area needs a better tool most?", "allow_multiple": false,
       "options": ["Project tracking", "Design handoff", "Internal docs", "Code review"]}
    ]'::jsonb
  );

  perform create_survey(
    p_title := 'Office Snack Restock',
    p_category := 'Lifestyle & Preferences',
    p_description := 'Quick and easy: just a few questions to help us stock the kitchen better.',
    p_deadline := now() + interval '14 days',
    p_questions := '[
      {"text": "What should we restock first?", "allow_multiple": true,
       "options": ["Fresh fruit", "Sparkling water", "Granola bars", "Coffee beans"]}
    ]'::jsonb
  );

  -- No deadline at all, so the "runs indefinitely" label has a real case.
  perform create_survey(
    p_title := 'Ongoing: Suggest a Team Value',
    p_category := 'Team Activities',
    p_description := 'An always-open box for ideas — add a value whenever one comes to mind.',
    p_deadline := null,
    p_questions := '[
      {"text": "Which value resonates with you most?", "allow_multiple": false,
       "options": ["Honesty", "Curiosity", "Ownership", "Collaboration"]}
    ]'::jsonb
  );

  -- Already closed, so "Past" has content and its own category filter is testable.
  perform create_survey(
    p_title := 'Office Coffee Preferences',
    p_category := 'Lifestyle & Preferences',
    p_description := 'Quick and easy: just a few questions to help us understand what works best for the team.',
    p_deadline := now() - interval '5 days',
    p_questions := '[
      {"text": "How do you take your coffee?", "allow_multiple": false,
       "options": ["Black", "With milk", "With sugar", "I don''t drink coffee"]}
    ]'::jsonb
  );

  perform create_survey(
    p_title := 'Remote vs. Office Days',
    p_category := 'Technology & Innovation',
    p_description := 'Looking back at last month''s split between home and office.',
    p_deadline := now() - interval '10 days',
    p_questions := '[
      {"text": "How many days did you work from the office?", "allow_multiple": false,
       "options": ["0", "1-2", "3-4", "5"]}
    ]'::jsonb
  );

  perform create_survey(
    p_title := 'Workshop Feedback: Public Speaking',
    p_category := 'Education & Learning',
    p_description := 'Help us improve the next round of workshops.',
    p_deadline := now() - interval '15 days',
    p_questions := '[
      {"text": "Was the workshop length right?", "allow_multiple": false,
       "options": ["Too short", "Just right", "Too long"]}
    ]'::jsonb
  );
end $$;
