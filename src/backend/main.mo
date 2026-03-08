import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type GameMode = {
    #timeAttack;
    #endless;
    #strategy;
    #powerBoost;
    #advancedStrategy;
  };

  type MissionType = {
    #clearLines : Nat;
    #scorePoints : Nat;
    #usePowerUps : Nat;
    #triggerChains : Nat;
    #completeGames : Nat;
    #clearTotalLines : Nat;
    #comboMultiplier : Nat;
  };

  type MissionReward = {
    #points : Nat;
    #powerUps : Nat;
    #comboBoost : Float;
  };

  type DailyMission = {
    missionType : MissionType;
    reward : MissionReward;
    progress : Nat;
    completed : Bool;
    claimed : Bool;
    description : Text;
  };

  type UserProfile = {
    name : Text;
    dailyLoginStreak : Nat;
    lastLoginTime : Time.Time;
    powerUps : Nat;
    avatar : ?Storage.ExternalBlob;
    preferredGameMode : GameMode;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var userProfiles = Map.empty<Principal, UserProfile>();
  var dailyMissions : Map.Map<Principal, [DailyMission]> = Map.empty();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Yetkisiz erişim: Sadece kendi profilini görebilirsin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Yetkisiz erişim: Sadece kullanıcılar kaydını düzenleyebilir");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateAvatar(image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Yetkisiz erişim: Sadece kayıtlı kullanıcılar avatar ekleyebilir");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Kayıt bulunamadı, lütfen önce profil oluşturarak kaydını başlat!") };
      case (?profile) {
        let updatedProfile = { profile with avatar = ?image };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func updateDailyLoginStreak(streak : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Yetkisiz erişim: Sadece kullanıcılar günlük giriş serisini güncelleyebilir");
    };
    updateProfileField(caller, func(p) { { p with dailyLoginStreak = streak } });
  };

  public shared ({ caller }) func updateLastLoginTime(time : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Yetkisiz erişim: Sadece kullanıcılar son giriş zamanını güncelleyebilir");
    };
    updateProfileField(caller, func(p) { { p with lastLoginTime = time } });
  };

  public shared ({ caller }) func updatePowerUps(powerUps : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Yetkisiz erişim: Sadece kullanıcılar güçlendirmeleri güncelleyebilir");
    };
    updateProfileField(caller, func(p) { { p with powerUps } });
  };

  public shared ({ caller }) func selectGameMode(mode : GameMode) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Yetkisiz erişim: Oyun modu seçmek için yetkin yok");
    };

    updateProfileField(caller, func(p) { { p with preferredGameMode = mode } });
  };

  public shared ({ caller }) func saveDailyMissions(missions : [DailyMission]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Yetkisiz erişim: Günlük görev kaydetmek için yetkin yok");
    };
    dailyMissions.add(caller, missions);
  };

  public query ({ caller }) func getDailyMissions() : async ?[DailyMission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Yetkisiz erişim: Görevleri görmek için giriş yapmalısın!");
    };
    dailyMissions.get(caller);
  };

  func updateProfileField(caller : Principal, updateFn : UserProfile -> UserProfile) {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Kayıt bulunamadı, lütfen önce profil oluştur!") };
      case (?profile) {
        let updatedProfile = updateFn(profile);
        userProfiles.add(caller, updatedProfile);
      };
    };
  };
};
