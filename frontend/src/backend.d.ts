import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export type MissionReward = {
    __kind__: "powerUps";
    powerUps: bigint;
} | {
    __kind__: "comboBoost";
    comboBoost: number;
} | {
    __kind__: "points";
    points: bigint;
};
export type MissionType = {
    __kind__: "clearTotalLines";
    clearTotalLines: bigint;
} | {
    __kind__: "clearLines";
    clearLines: bigint;
} | {
    __kind__: "completeGames";
    completeGames: bigint;
} | {
    __kind__: "usePowerUps";
    usePowerUps: bigint;
} | {
    __kind__: "comboMultiplier";
    comboMultiplier: bigint;
} | {
    __kind__: "scorePoints";
    scorePoints: bigint;
} | {
    __kind__: "triggerChains";
    triggerChains: bigint;
};
export interface DailyMission {
    reward: MissionReward;
    missionType: MissionType;
    completed: boolean;
    description: string;
    claimed: boolean;
    progress: bigint;
}
export interface UserProfile {
    lastLoginTime: Time;
    powerUps: bigint;
    name: string;
    preferredGameMode: GameMode;
    dailyLoginStreak: bigint;
    avatar?: ExternalBlob;
}
export enum GameMode {
    endless = "endless",
    strategy = "strategy",
    advancedStrategy = "advancedStrategy",
    powerBoost = "powerBoost",
    timeAttack = "timeAttack"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyMissions(): Promise<Array<DailyMission> | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDailyMissions(missions: Array<DailyMission>): Promise<void>;
    selectGameMode(mode: GameMode): Promise<void>;
    updateAvatar(image: ExternalBlob): Promise<void>;
    updateDailyLoginStreak(streak: bigint): Promise<void>;
    updateLastLoginTime(time: Time): Promise<void>;
    updatePowerUps(powerUps: bigint): Promise<void>;
}
