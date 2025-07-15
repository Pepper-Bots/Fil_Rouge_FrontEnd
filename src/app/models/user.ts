// models/user.model.ts

export interface User {
  id: number;
  enabled: boolean;
  lastName: string;
  firstName: string;
  email: string;
  password?: string; // Généralement jamais renvoyé par le back
  notifications?: Notification[];
  jetonVerificationEmail?: string;
  nomRole?: string;
  resetPasswordToken?: string;
}
