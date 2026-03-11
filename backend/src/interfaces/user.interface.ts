export const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
} as const;

export type TUser = {
  name: string;
  email: string;
  password: string;
  profile_picture: string
  status: typeof USER_STATUS[keyof typeof USER_STATUS];
  passwordChangedAt?: Date;
};

