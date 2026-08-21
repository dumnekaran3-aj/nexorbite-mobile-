import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Image as ImageIcon, FileUp, Check, Lock } from "lucide-react-native";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import * as digitalProductService from "@/services/digitalProductService";
import * as collegeService from "@/services/collegeService";
import { BRANCHES, BRANCH_CATEGORIES } from "@/constants/digitalProduct";

type PushTo = "community" | "both" | "none";

export default function CreateProductScreen() {
  const router = useRouter();
  const { collegeId: routeCollegeId } = useLocalSearchParams<{ collegeId?: string }>();

  const [slotDefs, setSlotDefs] = useState<Record<string, any[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [communities, setCommunities] = useState<{ collegeId: string; name: string; isprivate?: boolean }[]>([]);
  const [pushTo, setPushTo] = useState<PushTo>("community");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");

  const [branch, setBranch] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, { uri: string; name: string; mimeType: string }>>({});

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    digitalProductService
      .getSlotDefinitions()
      .then(setSlotDefs)
      .catch(() => setError("Couldn't load upload requirements. Try again later."))
      .finally(() => setLoadingSlots(false));

    collegeService
      .getMyCommunities()
      .then((res) => {
        const list: { collegeId: string; name: string; isprivate?: boolean }[] = [];
        if (res.privateCommunity) list.push({ collegeId: res.privateCommunity.collegeId, name: res.privateCommunity.name, isprivate: true });
        (res.publicCommunities || []).forEach((c: any) => list.push({ collegeId: c.collegeId, name: c.name, isprivate: false }));
        setCommunities(list);

        if (routeCollegeId) {
          setSelectedCollegeId(routeCollegeId);
        } else if (res.privateCommunity) {
          setSelectedCollegeId(res.privateCommunity.collegeId);
        } else if (list.length > 0) {
          setSelectedCollegeId(list[0].collegeId);
        }
      })
      .catch((err) => console.error("Communities fetch error:", err));
  }, []);

  const pickCover = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      aspect: [1, 1],
      allowsEditing: true,
    });
    if (!result.canceled) setCoverUri(result.assets[0].uri);
  };

  const pickSlotFile = async (slot: string) => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setFiles((prev) => ({
      ...prev,
      [slot]: { uri: asset.uri, name: asset.name, mimeType: asset.mimeType || "application/octet-stream" },
    }));
  };

  const activeSlots = branch ? slotDefs[branch] || [] : [];
  const activeCategories = branch ? BRANCH_CATEGORIES[branch] || [] : [];

  const handleSubmit = async () => {
    setError("");
    if (!branch) return setError("Please select a branch.");
    if (!category) return setError("Please select a category.");
    if (!title.trim() || !description.trim()) return setError("Please fill in title and description.");
    if (!coverUri) return setError("A cover image is required.");
    if (pushTo !== "none" && communities.length > 0 && !selectedCollegeId) return setError("Please choose which community this goes to.");

    const missingRequired = activeSlots.filter((s) => s.required && !files[s.slot]);
    if (missingRequired.length > 0) {
      return setError(`Missing required file: ${missingRequired[0].label}`);
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("branch", branch);
      formData.append("category", category);
      formData.append("price", "0"); // Paid listings are Coming Soon — always free for now
      formData.append("pushTo", pushTo);
      if (pushTo !== "none" && selectedCollegeId) formData.append("collegeId", selectedCollegeId);

      formData.append("cover", { uri: coverUri, name: "cover.jpg", type: "image/jpeg" } as any);

      Object.entries(files).forEach(([slot, file]) => {
        formData.append(slot, { uri: file.uri, name: file.name, type: file.mimeType } as any);
      });

      await digitalProductService.createProduct(formData);
      router.back();
    } catch (err: any) {
      setError(err.response?.data?.message || "Couldn't publish. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSlots) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator color="#8478bb" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-navy-900" contentContainerClassName="px-5 py-14 pb-20">
      <Text className="text-white text-xl font-bold mb-1">Sell a Product</Text>
      <Text className="text-navy-400 text-sm mb-6">Share notes, projects, or resources with your college.</Text>

      <Text className="text-navy-400 text-xs mb-2 uppercase tracking-wide">Branch *</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {BRANCHES.map((b) => (
          <Pressable
            key={b}
            onPress={() => { setBranch(b); setCategory(""); setFiles({}); }}
            className={branch === b ? "px-3 py-2 rounded-full bg-brand-500 border border-brand-500" : "px-3 py-2 rounded-full bg-navy-800 border border-navy-600"}
          >
            <Text className={branch === b ? "text-white text-xs font-semibold" : "text-navy-400 text-xs"}>{b}</Text>
          </Pressable>
        ))}
      </View>

      {!!branch && (
        <>
          <Text className="text-navy-400 text-xs mb-2 uppercase tracking-wide">Category *</Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {activeCategories.map((c) => (
              <Pressable key={c} onPress={() => setCategory(c)} className={category === c ? "px-3 py-2 rounded-full bg-brand-500 border border-brand-500" : "px-3 py-2 rounded-full bg-navy-800 border border-navy-600"}>
                <Text className={category === c ? "text-white text-xs font-semibold" : "text-navy-400 text-xs"}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <View className="gap-3 mb-5">
        <Input placeholder="Title" value={title} onChangeText={setTitle} />
        <Input placeholder="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} />
      </View>

      <Text className="text-navy-400 text-xs mb-2 uppercase tracking-wide">Pricing *</Text>
      <View className="flex-row gap-3 mb-1">
        <View className="flex-1 py-3 rounded-2xl border border-brand-500 bg-brand-600/20 items-center">
          <Text className="text-brand-300 text-sm font-bold">🆓 Free</Text>
        </View>
        <View className="flex-1 relative">
          <View className="py-3 rounded-2xl border border-navy-600 items-center opacity-50">
            <View className="flex-row items-center gap-1.5">
              <Lock size={12} color="#4d5569" />
              <Text className="text-navy-400 text-sm font-bold">Paid</Text>
            </View>
          </View>
          <View className="absolute -top-2 -right-2 bg-yellow-500 rounded-full px-2 py-0.5">
            <Text className="text-[9px] font-bold text-black">Coming Soon</Text>
          </View>
        </View>
      </View>
      <Text className="text-navy-400 text-xs mb-6">Paid listings are launching soon — only free listings for now.</Text>

      <Text className="text-navy-400 text-xs mb-2 uppercase tracking-wide">Where should this be posted? *</Text>
      <View className="gap-2 mb-1">
        {([
          { id: "community" as PushTo, label: "Community feed only" },
          { id: "both" as PushTo, label: "Community + Marketplace" },
          { id: "none" as PushTo, label: "Marketplace only (don't push)" },
        ]).map((opt) => (
          <Pressable
            key={opt.id}
            onPress={() => setPushTo(opt.id)}
            className={pushTo === opt.id ? "flex-row items-center justify-between px-4 py-3 rounded-2xl border border-brand-500 bg-brand-500/10" : "flex-row items-center justify-between px-4 py-3 rounded-2xl border border-navy-600 bg-navy-800"}
          >
            <Text className={pushTo === opt.id ? "text-white text-sm font-medium" : "text-navy-400 text-sm"}>{opt.label}</Text>
            {pushTo === opt.id && <Check size={16} color="#8478bb" />}
          </Pressable>
        ))}
      </View>

      {pushTo !== "none" && (
        <View className="mb-5 mt-3">
          <Text className="text-navy-400 text-xs mb-2 uppercase tracking-wide">Which community?</Text>
          {communities.length === 0 ? (
            <Text className="text-navy-400 text-xs">You're not in any community yet — this will only be listed on the marketplace.</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {communities.map((c) => (
                <Pressable
                  key={c.collegeId}
                  onPress={() => setSelectedCollegeId(c.collegeId)}
                  className={selectedCollegeId === c.collegeId ? "px-3 py-2 rounded-full bg-brand-500 border border-brand-500" : "px-3 py-2 rounded-full bg-navy-800 border border-navy-600"}
                >
                  <Text className={selectedCollegeId === c.collegeId ? "text-white text-xs font-semibold" : "text-navy-400 text-xs"}>
                    {c.name} {c.isprivate ? "(Private)" : "(Public)"}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      <Text className="text-navy-400 text-xs mb-2 uppercase tracking-wide">Cover Image *</Text>
      <Pressable onPress={pickCover} className="bg-navy-800 border border-navy-600 rounded-2xl h-32 items-center justify-center overflow-hidden">
        {coverUri ? (
          <Image source={{ uri: coverUri }} className="w-full h-full" />
        ) : (
          <View className="items-center gap-2">
            <ImageIcon size={22} color="#4d5569" />
            <Text className="text-navy-400 text-xs">Tap to choose an image</Text>
          </View>
        )}
      </Pressable>

      {!!branch && activeSlots.length > 0 && (
        <>
          <Text className="text-navy-400 text-xs mt-6 mb-2 uppercase tracking-wide">Files</Text>
          <View className="gap-2">
            {activeSlots.map((s) => {
              const picked = files[s.slot];
              return (
                <Pressable key={s.slot} onPress={() => pickSlotFile(s.slot)} className="flex-row items-center gap-3 bg-navy-800 border border-navy-600 rounded-2xl px-4 py-3.5">
                  {picked ? <Check size={16} color="#4ade80" /> : <FileUp size={16} color="#8478bb" />}
                  <View className="flex-1">
                    <Text className="text-white text-sm">
                      {s.label} {s.required && <Text className="text-red-400">*</Text>}
                    </Text>
                    <Text className="text-navy-400 text-xs mt-0.5" numberOfLines={1}>
                      {picked ? picked.name : `Accepts ${s.accept}`}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {!!error && <Text className="text-red-400 text-sm mt-5">{error}</Text>}

      <View className="mt-6">
        <Button title="Publish" onPress={handleSubmit} loading={submitting} />
      </View>
    </ScrollView>
  );
}
