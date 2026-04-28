export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  couple_id: string | null;
  created_at: string;
};

export type Couple = {
  id: string;
  invite_code: string;
  user_a: string;
  user_b: string | null;
  daily_limit: number;
  created_at: string;
};

export type ThoughtTap = {
  id: string;
  couple_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
};
