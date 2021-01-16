export interface UserListItem {
    email: string;
    uid: string;
    customClaims: { role?: string; firstAdministrator?: boolean };
    photoURL: string;
    firstAdministrator: boolean;
}
