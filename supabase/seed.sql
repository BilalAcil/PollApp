-- Sample data for local testing and grading.
-- Run after schema.sql, in the Supabase SQL Editor. Includes one survey with
-- a deadline in the past, so the "Past" tab has something to show.

do $$
begin
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
    p_title := 'Fit & wellness survey!',
    p_category := 'Health & Wellness',
    p_deadline := now() + interval '2 days',
    p_questions := '[
      {"text": "How often do you exercise per week?", "allow_multiple": false,
       "options": ["0", "1-2", "3-4", "5+"]}
    ]'::jsonb
  );

  perform create_survey(
    p_title := 'Gaming habits and favorite games!',
    p_category := 'Gaming & Entertainment',
    p_deadline := now() + interval '3 days',
    p_questions := '[
      {"text": "Which platform do you play on most?", "allow_multiple": true,
       "options": ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"]}
    ]'::jsonb
  );

  perform create_survey(
    p_title := 'Office coffee preferences',
    p_category := 'Lifestyle & Preferences',
    p_deadline := now() - interval '5 days',
    p_questions := '[
      {"text": "How do you take your coffee?", "allow_multiple": false,
       "options": ["Black", "With milk", "With sugar", "I don''t drink coffee"]}
    ]'::jsonb
  );
end $$;
