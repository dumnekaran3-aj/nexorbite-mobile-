
import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, Image, ActivityIndicator, RefreshControl, Modal, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Users, GraduationCap, Clock, UserPlus, Info, Plus, X } from "lucide-react-native";
import * as collegeService from "@/services/collegeService";
import * as groupsService from "@/services/groupsService";
import * as feedService from "@/services/feedService";
import * as membersService from "@/services/membersService";
import * as friendsService from "@/services/friendsService";
import FeedPost from "@/components/feed/FeedPost";
import Button from "@/components/ui/Button";

type Tab = "feed" | "members" | "groups" | "discover";
const CAN_CREATE_ROLES = ["teacher", "hod", "principal", "owner"];

export default function CommunityPageScreen() {
  const { collegeId } = useLocalSearchParams<{ collegeId: string }>();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("feed");
  const [college, setCollege] = useState<any>(null);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const [groups, setGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  const [discover, setDiscover] = useState<any[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);

  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const loadCollege = useCallback(() => {
    collegeService
      .getCommunityInfo(collegeId)
      .then((res) => {
        setCollege(res.college);
        setMyRole(res.myRole);
      })
      .catch((err) => console.error("Community info error:", err))
      .finally(() => setLoading(false));
  }, [collegeId]);

  useEffect(() => {
    loadCollege();
    friendsService
      .getFriends(collegeId)
      .then((res) => setFriendIds(new Set((res.friends || []).map((f: any) => f._id))))
      .catch(() => {});
  }, [collegeId]);

  const loadFeed = useCallback(() => {
    setFeedLoading(true);
    feedService.getCommunityFeed(1, 20, collegeId).then((res) => setFeedPosts(res.posts || [])).catch((err) => console.error(err)).finally(() => setFeedLoading(false));
  }, [collegeId]);

  const loadMembers = useCallback(() => {
    setMembersLoading(true);
    membersService.getCollegeStudents(collegeId).then((res) => setMembers(res.members || [])).catch((err) => console.error(err)).finally(() => setMembersLoading(false));
  }, [collegeId]);

  const loadGroups = useCallback(() => {
    setGroupsLoading(true);
    groupsService.getGroups(collegeId).then((res) => setGroups(res.groups || [])).catch((err) => console.error(err)).finally(() => setGroupsLoading(false));
  }, [collegeId]);

  const loadDiscover = useCallback(() => {
    setDiscoverLoading(true);
    membersService.getSameBranchStudents(collegeId).then((res) => setDiscover(res.students || [])).catch((err) => console.error(err)).finally(() => setDiscoverLoading(false));
  }, [collegeId]);

  useEffect(() => {
    if (tab === "feed" && feedPosts.length === 0) loadFeed();
    if (tab === "members" && members.length === 0) loadMembers();
    if (tab === "groups" && groups.length === 0) loadGroups();
    if (tab === "discover" && discover.length === 0) loadDiscover();
  }, [tab]);

  const confirmRequestJoinGroup = (group: any) => {
    Alert.alert(
      "Request to join?",
      `Your request to join "${group.name}" will be sent to the group admin for approval.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request",
          onPress: async () => {
            try {
              await groupsService.joinGroup(group._id);
            } catch (err) {
              console.error("Join request error:", err);
            } finally {
              setRequestedIds((prev) => new Set(prev).add(group._id));
            }
          },
        },
      ]
    );
  };

  const handleConnect = async (userId: string) => {
    setSentIds((prev) => new Set(prev).add(userId));
    try {
      await friendsService.sendFriendRequest(userId, undefined, collegeId);
    } catch (err) {
      console.error("Send request error:", err);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      "Leave community?",
      `Leave "${college?.college_name}"? You can rejoin later with an invite code.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            setLeaving(true);
            try {
              await collegeService.leaveCollege(collegeId);
              setShowInfo(false);
              router.back();
            } catch (err: any) {
              Alert.alert("Couldn't leave", err.response?.data?.msg || "Please try again.");
            } finally {
              setLeaving(false);
            }
          },
        },
      ]
    );
  };

  const openProfile = (userId: string) => router.push(`/(app)/friends/public-profile/${userId}` as any);

  const canCreateGroup = CAN_CREATE_ROLES.includes(myRole || "");

  const TabButton = ({ id, label, count }: { id: Tab; label: string; count?: number }) => (
    <Pressable onPress={() => setTab(id)} className={tab === id ? "flex-1 items-center py-2.5 border-b-2 border-brand-500" : "flex-1 items-center py-2.5 border-b-2 border-transparent"}>
      <Text className={tab === id ? "text-white text-xs font-semibold" : "text-navy-400 text-xs"}>
        {label}{typeof count === "number" ? ` (${count})` : ""}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator color="#8478bb" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: college?.college_name || "Community",
          headerStyle: { backgroundColor: "#12172a" },
          headerTintColor: "#fff",
          headerRight: () => (
            <Pressable onPress={() => setShowInfo(true)} className="mr-1">
              <Info size={20} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <View className="flex-1 bg-navy-900">
        {!!college?.banner_url && (
          <Image source={{ uri: college.banner_url }} className="w-full h-24" resizeMode="cover" />
        )}
        <View className="px-5 py-5 border-b border-navy-700">
          <View className="flex-row items-center gap-3">
            <View className="w-14 h-14 rounded-2xl bg-brand-600 items-center justify-center overflow-hidden">
              {college?.logo_url ? (
                <Image source={{ uri: college.logo_url }} className="w-full h-full" />
              ) : (
                <Text className="text-white font-extrabold text-xl">{college?.college_name?.[0]?.toUpperCase() || "C"}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold" numberOfLines={1}>{college?.college_name}</Text>
              {!!college?.university && <Text className="text-navy-400 text-xs mt-0.5" numberOfLines={1}>{college.university}</Text>}
              <View className="flex-row items-center gap-3 mt-1.5">
                <View className="flex-row items-center gap-1.5">
                  <Users size={12} color="#4d5569" />
                  <Text className="text-navy-400 text-xs">{college?.usageCount || members.length || 0} members</Text>
                </View>
                <View className={college?.status === "active" ? "px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20" : "px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20"}>
                  <Text className={college?.status === "active" ? "text-green-400 text-[10px] font-semibold" : "text-yellow-400 text-[10px] font-semibold"}>
                    {college?.status || "active"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row border-b border-navy-700">
          <TabButton id="feed" label="Feed" />
          <TabButton id="members" label="Members" count={members.length} />
          <TabButton id="groups" label="Groups" count={groups.length} />
          <TabButton id="discover" label="Discover" />
        </View>

        {tab === "feed" && (
          feedLoading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color="#8478bb" /></View> : (
            <FlatList
              data={feedPosts}
              keyExtractor={(item) => item._id}
              refreshControl={<RefreshControl refreshing={false} onRefresh={loadFeed} tintColor="#8478bb" />}
              renderItem={({ item }) => (
                <FeedPost post={item} onOpen={() => router.push({ pathname: "/(app)/feed/[postId]", params: { postId: item._id, fallback: JSON.stringify(item) } })} />
              )}
              ListEmptyComponent={<Text className="text-navy-400 text-center py-16">No products in this community's feed yet.</Text>}
            />
          )
        )}

        {tab === "members" && (
          membersLoading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color="#8478bb" /></View> : (
            <FlatList
              data={members}
              keyExtractor={(item) => item._id}
              refreshControl={<RefreshControl refreshing={false} onRefresh={loadMembers} tintColor="#8478bb" />}
              contentContainerClassName="px-4 py-3"
              renderItem={({ item }) => {
                const isFriend = friendIds.has(item._id);
                const isSent = sentIds.has(item._id);
                return (
                  <Pressable onPress={() => openProfile(item._id)} className="flex-row items-center gap-3 py-3 border-b border-navy-800">
                    <View className="w-10 h-10 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
                      {item.avatar ? <Image source={{ uri: item.avatar }} className="w-full h-full" /> : <GraduationCap size={16} color="#a79fd3" />}
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text className="text-white font-semibold text-sm" numberOfLines={1}>{item.fullName || item.username}</Text>
                      <Text className="text-navy-400 text-xs mt-0.5" numberOfLines={1}>@{item.username} · {item.stream || "—"}</Text>
                    </View>
                    {!isFriend && (
                      <Pressable onPress={() => handleConnect(item._id)} disabled={isSent} className={isSent ? "px-2.5 py-1 rounded-full bg-navy-700" : "px-2.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/40"}>
                        <Text className={isSent ? "text-navy-400 text-[10px] font-semibold" : "text-brand-300 text-[10px] font-semibold"}>{isSent ? "Sent" : "Connect"}</Text>
                      </Pressable>
                    )}
                  </Pressable>
                );
              }}
              ListEmptyComponent={<Text className="text-navy-400 text-center py-16">No members found.</Text>}
            />
          )
        )}

        {tab === "groups" && (
          <>
            {canCreateGroup && (
              <View className="px-4 pt-3">
                <Pressable
                  onPress={() => router.push({ pathname: "/(app)/groups/create", params: { collegeId } })}
                  className="flex-row items-center justify-center gap-2 border border-brand-500/40 bg-brand-500/10 rounded-full py-2.5"
                >
                  <Plus size={15} color="#8478bb" />
                  <Text className="text-brand-300 text-sm font-semibold">Create Group</Text>
                </Pressable>
              </View>
            )}
            {groupsLoading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color="#8478bb" /></View> : (
              <FlatList
                data={groups}
                keyExtractor={(item) => item._id}
                refreshControl={<RefreshControl refreshing={false} onRefresh={loadGroups} tintColor="#8478bb" />}
                contentContainerClassName="px-4 py-3"
                renderItem={({ item }) => {
                  const isRequested = requestedIds.has(item._id);
                  return (
                    <View className="flex-row items-center gap-3 bg-navy-800 border border-navy-600 rounded-2xl p-3 mb-2.5">
                      <View className="w-12 h-12 rounded-xl bg-brand-600/40 items-center justify-center overflow-hidden">
                        {item.avatar ? <Image source={{ uri: item.avatar }} className="w-full h-full" /> : <Text className="text-white font-extrabold text-lg">{item.name?.[0]?.toUpperCase() || "G"}</Text>}
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text className="text-white font-semibold text-sm" numberOfLines={1}>{item.name}</Text>
                        <Text className="text-navy-400 text-xs mt-0.5" numberOfLines={1}>{item.description || `${item.memberDetails?.length || 0} members`}</Text>
                      </View>
                      <Pressable onPress={() => confirmRequestJoinGroup(item)} disabled={isRequested} className={isRequested ? "flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-navy-700" : "px-2.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/40"}>
                        {isRequested ? (<><Clock size={10} color="#4d5569" /><Text className="text-navy-400 text-[10px] font-semibold">Requested</Text></>) : (
                          <Text className="text-brand-300 text-[10px] font-semibold">Ask to join</Text>
                        )}
                      </Pressable>
                    </View>
                  );
                }}
                ListEmptyComponent={<Text className="text-navy-400 text-center py-16">No groups in this community yet.</Text>}
              />
            )}
          </>
        )}

        {tab === "discover" && (
          discoverLoading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color="#8478bb" /></View> : (
            <FlatList
              data={discover}
              keyExtractor={(item) => item._id}
              refreshControl={<RefreshControl refreshing={false} onRefresh={loadDiscover} tintColor="#8478bb" />}
              contentContainerClassName="px-4 py-3"
              renderItem={({ item }) => {
                const isFriend = friendIds.has(item._id);
                const isSent = sentIds.has(item._id);
                return (
                  <Pressable onPress={() => openProfile(item._id)} className="flex-row items-center gap-3 py-3 border-b border-navy-800">
                    <View className="w-10 h-10 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
                      {item.avatar ? <Image source={{ uri: item.avatar }} className="w-full h-full" /> : <GraduationCap size={16} color="#a79fd3" />}
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text className="text-white font-semibold text-sm" numberOfLines={1}>{item.fullName || item.username}</Text>
                      <Text className="text-navy-400 text-xs mt-0.5" numberOfLines={1}>{item.stream || "—"}</Text>
                    </View>
                    {!isFriend && (
                      <Pressable onPress={() => handleConnect(item._id)} disabled={isSent} className={isSent ? "px-2.5 py-1 rounded-full bg-navy-700" : "px-2.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/40 flex-row items-center gap-1"}>
                        {isSent ? <Text className="text-navy-400 text-[10px] font-semibold">Sent</Text> : (<><UserPlus size={11} color="#8478bb" /><Text className="text-brand-300 text-[10px] font-semibold">Add</Text></>)}
                      </Pressable>
                    )}
                  </Pressable>
                );
              }}
              ListEmptyComponent={<Text className="text-navy-400 text-center py-16">No suggestions right now.</Text>}
            />
          )
        )}
      </View>

      <Modal visible={showInfo} transparent animationType="fade" onRequestClose={() => setShowInfo(false)}>
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <View className="bg-navy-800 border border-navy-600 rounded-3xl p-6 w-full">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-bold">Community Info</Text>
              <Pressable onPress={() => setShowInfo(false)}><X size={20} color="#4d5569" /></Pressable>
            </View>

            <View className="gap-2.5">
              <View className="flex-row justify-between">
                <Text className="text-navy-400 text-sm">Name</Text>
                <Text className="text-white text-sm font-medium">{college?.college_name}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-navy-400 text-sm">University</Text>
                <Text className="text-white text-sm font-medium">{college?.university}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-navy-400 text-sm">Members</Text>
                <Text className="text-white text-sm font-medium">{college?.usageCount || 0} / {college?.usageLimit || 1000}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-navy-400 text-sm">Status</Text>
                <Text className={college?.status === "active" ? "text-green-400 text-sm font-medium" : "text-yellow-400 text-sm font-medium"}>{college?.status}</Text>
              </View>
              {!!college?.description && (
                <View className="pt-3 border-t border-navy-700 mt-1">
                  <Text className="text-navy-400 text-xs mb-1">About</Text>
                  <Text className="text-white text-sm">{college.description}</Text>
                </View>
              )}
            </View>

            {myRole !== "owner" && (
              <View className="mt-5">
                <Button title={leaving ? "Leaving..." : "Leave Community"} onPress={handleLeave} variant="outline" loading={leaving} />
              </View>
            )}
            <View className="mt-2">
              <Button title="Close" onPress={() => setShowInfo(false)} variant="outline" />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
