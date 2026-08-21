import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator, Modal } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  LogOut, GraduationCap, Pencil, ChevronRight, Users, BadgeCheck, Lock, Globe,
  School, Copy, Check, Handshake, ShieldCheck, ShoppingBag, Eye, X,
} from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { useCollegeStore } from "@/store/collegeStore";
import * as profileService from "@/services/profileService";
import * as portfolioService from "@/services/portfolioService";

function StatItem({ icon, value, label, onPress }: { icon: any; value: number; label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} className="flex-1 items-center gap-1 py-2">
      {icon}
      <Text className="text-white font-bold text-sm">{value ?? 0}</Text>
      <Text className="text-navy-400 text-[10px]">{label}</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const storeUser = useAuthStore((s) => s.user);
  const { collegeId, collegeName, role, isOwner, inviteCode } = useCollegeStore();

  const [profile, setProfile] = useState<any>(storeUser);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [enlarge, setEnlarge] = useState(false);

  useEffect(() => {
    profileService.getMyProfile().then((data) => setProfile(data.profile)).catch(() => {}).finally(() => setLoading(false));
    portfolioService.getMyProjects().then((res) => setProjects(res.projects || [])).catch(() => {});
    portfolioService.getMyDigitalProducts().then((res) => setProducts(res.data || [])).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !profile) {
    return <View className="flex-1 bg-navy-900 items-center justify-center"><ActivityIndicator color="#8478bb" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-navy-900" contentContainerClassName="pb-10">
      <View className="px-4 pt-14 pb-3">
        <Text className="text-white text-xl font-bold tracking-tight">Profile</Text>
      </View>

      <View className="mx-4 bg-navy-800 border border-navy-600 rounded-3xl p-5">
        <View className="flex-row items-end justify-between mb-3">
          <Pressable onPress={() => setEnlarge(true)}>
            <View className="w-20 h-20 rounded-full bg-navy-700 border-2 border-brand-500 items-center justify-center overflow-hidden">
              {profile?.avatar ? <Image source={{ uri: profile.avatar }} className="w-full h-full" /> : <GraduationCap size={26} color="#a79fd3" />}
            </View>
          </Pressable>
          <Pressable onPress={() => router.push("/(auth)/profile-setup")} className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border border-navy-500">
            <Pencil size={12} color="#a79fd3" />
            <Text className="text-navy-300 text-xs font-semibold">Edit</Text>
          </Pressable>
        </View>

        <View className="flex-row items-center flex-wrap gap-1.5">
          <Text className="text-white text-lg font-bold">{profile?.full_name || profile?.fullName || profile?.username}</Text>
          {profile?.isVerified && (
            <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30">
              <BadgeCheck size={11} color="#7dd3fc" />
              <Text className="text-sky-300 text-[10px] font-semibold">Verified</Text>
            </View>
          )}
          {!!role && (
            <View className="px-2 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30">
              <Text className="text-brand-300 text-[10px] font-semibold uppercase">{role}</Text>
            </View>
          )}
          <View className={profile?.isPrivate ? "flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-navy-700 border border-navy-500" : "flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30"}>
            {profile?.isPrivate ? <Lock size={10} color="#4d5569" /> : <Globe size={10} color="#4ade80" />}
            <Text className={profile?.isPrivate ? "text-navy-400 text-[10px] font-semibold" : "text-green-400 text-[10px] font-semibold"}>
              {profile?.isPrivate ? "Private" : "Public"}
            </Text>
          </View>
        </View>

        {!!profile?.username && <Text className="text-navy-400 text-sm mt-0.5">@{profile.username}</Text>}

        <View className="flex-row items-center flex-wrap gap-2 mt-2">
          {!!profile?.stream && (
            <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-navy-700 border border-navy-600">
              <GraduationCap size={11} color="#a79fd3" />
              <Text className="text-navy-300 text-[11px]">{profile.stream}</Text>
            </View>
          )}
          {!!collegeId && (
            <Pressable onPress={() => router.push({ pathname: "/(app)/community/[collegeId]", params: { collegeId } })} className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-brand-600/15 border border-brand-500/30">
              <School size={11} color="#a79fd3" />
              <Text className="text-brand-300 text-[11px] font-semibold" numberOfLines={1}>{collegeName}</Text>
            </Pressable>
          )}
          {isOwner && !!inviteCode && (
            <Pressable onPress={copyCode} className={copied ? "flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-green-600/20 border border-green-500/40" : "flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-navy-700 border border-navy-600"}>
              {copied ? <Check size={11} color="#4ade80" /> : <Copy size={11} color="#a79fd3" />}
              <Text className={copied ? "text-green-300 text-[11px] font-mono" : "text-navy-300 text-[11px] font-mono"}>{copied ? "Copied!" : inviteCode}</Text>
            </Pressable>
          )}
        </View>

        {!!profile?.bio && <Text className="text-navy-300 text-sm leading-relaxed mt-3">{profile.bio}</Text>}

        {!!profile?.skills?.length && (
          <View className="flex-row flex-wrap gap-1.5 mt-3">
            {profile.skills.map((s: string) => (
              <View key={s} className="px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
                <Text className="text-brand-300 text-[11px]">{s}</Text>
              </View>
            ))}
          </View>
        )}

        <View className="flex-row mt-4 pt-4 border-t border-navy-700">
          <StatItem icon={<Users size={16} color="#a79fd3" />} value={profile?.friendsCount} label="Friends" onPress={() => router.push("/(app)/my-friends")} />
          <StatItem icon={<Handshake size={16} color="#a79fd3" />} value={profile?.collabCount} label="Collabs" />
          <StatItem icon={<ShieldCheck size={16} color="#a79fd3" />} value={profile?.trustScore} label="Trust" />
          <StatItem icon={<ShoppingBag size={16} color="#a79fd3" />} value={profile?.salesCount} label="Sales" />
          <StatItem icon={<Eye size={16} color="#a79fd3" />} value={profile?.uniqueImpressionsCount} label="Views" />
        </View>
      </View>

      {(projects.length > 0 || products.length > 0) && (
        <View className="mx-4 mt-4 bg-navy-800 border border-navy-600 rounded-3xl p-5">
          {projects.length > 0 && (
            <View className="mb-1">
              <Text className="text-navy-400 text-xs font-bold uppercase tracking-wide mb-3">Projects ({projects.length})</Text>
              <View className="flex-row flex-wrap gap-2">
                {projects.map((p: any) => (
                  <View key={p._id} className="w-[31%] bg-navy-700 border border-navy-600 rounded-xl overflow-hidden">
                    <View className="aspect-square bg-navy-900 items-center justify-center">
                      {p.image ? <Image source={{ uri: p.image }} className="w-full h-full" /> : <Text style={{ fontSize: 20 }}>📁</Text>}
                    </View>
                    <Text className="text-white text-[10px] font-semibold px-1.5 py-1" numberOfLines={1}>{p.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {products.length > 0 && (
            <View className={projects.length > 0 ? "mt-4" : ""}>
              <Text className="text-navy-400 text-xs font-bold uppercase tracking-wide mb-3">Digital Products ({products.length})</Text>
              <View className="flex-row flex-wrap gap-2">
                {products.map((p: any) => (
                  <View key={p._id} className="w-[31%] bg-navy-700 border border-navy-600 rounded-xl overflow-hidden">
                    <View className="aspect-square bg-navy-900 items-center justify-center">
                      {p.thumbnailUrl ? <Image source={{ uri: p.thumbnailUrl }} className="w-full h-full" /> : <Text style={{ fontSize: 20 }}>🛍️</Text>}
                    </View>
                    <Text className="text-white text-[10px] font-semibold px-1.5 py-1" numberOfLines={1}>{p.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      <View className="px-4 mt-4 gap-2">
        <Pressable onPress={() => router.push("/(app)/communities")} className="flex-row items-center justify-between bg-navy-800 border border-navy-600 rounded-2xl px-4 py-3.5">
          <View className="flex-row items-center gap-3">
            <Users size={16} color="#8478bb" />
            <Text className="text-white text-sm font-medium">Communities</Text>
          </View>
          <ChevronRight size={16} color="#4d5569" />
        </Pressable>

        <Pressable onPress={handleLogout} className="flex-row items-center justify-between bg-navy-800 border border-red-900/40 rounded-2xl px-4 py-3.5">
          <View className="flex-row items-center gap-3">
            <LogOut size={16} color="#f87171" />
            <Text className="text-red-400 text-sm font-medium">Log Out</Text>
          </View>
        </Pressable>
      </View>

      <Modal visible={enlarge} transparent animationType="fade" onRequestClose={() => setEnlarge(false)}>
        <Pressable className="flex-1 bg-black/85 items-center justify-center" onPress={() => setEnlarge(false)}>
          <Pressable onPress={() => setEnlarge(false)} className="absolute top-14 right-6 z-10"><X size={26} color="#fff" /></Pressable>
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} className="w-80 h-80 rounded-full" resizeMode="cover" />
          ) : (
            <GraduationCap size={100} color="#a79fd3" />
          )}
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
