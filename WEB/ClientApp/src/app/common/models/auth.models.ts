export interface LoginModel {
    username: string;
    password: string;
}

export interface ResetPasswordModel {
    userName: string;
}

export interface ResetModel {
    token: string;
    userName: string;
    newPassword: string;
    confirmPassword: string;
}

export interface RegisterModel {
    userName: string;
    password: string;
    // todo: add this
    //confirmPassword: string;
}

export interface AuthStateModel {
    tokens?: AuthTokenModel;
    jwtToken?: JwtTokenModel;
    authReady?: boolean;
}

export interface AuthTokenModel {
    access_token: string;
    refresh_token: string;
    id_token: string;
    expires_in: number;
    token_type: string;
    expiration_date: string;
}

export interface RefreshGrantModel {
    refresh_token: string;
}

export class ChangePasswordModel {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface JwtTokenModel {
    sub: string;
    jti: string;
    useage: string;
    at_hash: string;
    nbf: number;
    exp: number;
    iat: number;
    iss: string;
    role: string[] | string;
}

export class PasswordRequirements {
    requiredLength = 6;
    requiredUniqueChars = 1;
    requireNonAlphanumeric = true;
    requireLowercase = true;
    requireUppercase = true;
    requireDigit = true;
}
