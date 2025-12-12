// types.ts

export interface UserActivity {
  id: string; // uuid
  user_id: string; // uuid

  activity_type: string;
  activity_name: string;
  activity_description: string | null;

  cover_image_url: string | null;

  activity_registration_number: string | null;

  registration_time: string; // ISO timestamps returned by Supabase
  start_time: string | null;
  completion_time: string | null;
}

export interface UserProfileMinimal {
  id: string;
  full_name: string;
  profession: string | null;
  profile_photo_url: string | null;
}
