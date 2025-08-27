export type LoginFormType = {
  email: string;
  userMobile: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export interface AuthModalProps {
  open: boolean;
  handleClose: () => void;
  validInputValue: { email?: string; mobile?: string };
}

export interface ExtendedJwtPayload {
  sub: string;
  authorities: { authority: string }[];
  organizationId: string;
  level: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface SignInResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
  timestamp: string;
}
