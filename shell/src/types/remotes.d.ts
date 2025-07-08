declare module 'auth/AuthApp' {
  const AuthApp: React.ComponentType<{ onAuthChange?: (user: any) => void }>;
  export default AuthApp;
  export const mount: (element: HTMLElement, props?: any) => () => void;
}

declare module 'directory/DirectoryApp' {
  const DirectoryApp: React.ComponentType;
  export default DirectoryApp;
  export const mount: (element: HTMLElement, props?: any) => () => void;
}

declare module 'memoryGame/MemoryGameApp' {
  const MemoryGameApp: React.ComponentType<{ userId?: number; username?: string }>;
  export default MemoryGameApp;
  export const mount: (element: HTMLElement, props?: any) => () => void;
}

declare module 'profile/ProfileApp' {
  const ProfileApp: React.ComponentType<{ userId?: number; username?: string }>;
  export default ProfileApp;
  export const mount: (element: HTMLElement, props?: any) => () => void;
}
