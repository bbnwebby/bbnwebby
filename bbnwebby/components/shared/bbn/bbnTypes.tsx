export type BBNRegion =
  | "uttarandhra"
  | "andhra"
  | "rayalaseema"
  | "telangana";

export interface BBNDirector {
  id: string;
  name: string;
  phone_number: string;
  city: string;
  state: string;
  district: string;
  photo_url: string;
  region: BBNRegion;
  created_at: string;
}
