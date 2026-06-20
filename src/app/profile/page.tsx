"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSearchParams } from "next/navigation";
import { User, Mail, Phone, Camera, CheckCircle } from "lucide-react";

interface CosmetologistProfileData {
  specializations: string[];
  experienceYears: number | null;
  bio: string | null;
  workingHours: Record<string, { start: string; end: string }> | null;
  isPublic: boolean;
}

interface ClientPersonalInfoData {
  skinType: string | null;
  allergies: string | null;
  preferences: Record<string, unknown> | null;
  medicalConditions: string | null;
}

interface FullUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  phone: string | null;
  settings: Record<string, unknown> | null;
  cosmetologistProfile?: CosmetologistProfileData | null;
  clientPersonalInfo?: ClientPersonalInfoData | null;
}

function ProfileForm({ user, onSuccess }: {
  user: FullUser;
  onSuccess: () => Promise<unknown>;
}) {
  const cosmetologistProfile = user.cosmetologistProfile;
  const clientPersonalInfo = user.clientPersonalInfo;

  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [specializations, setSpecializations] = useState(
    (cosmetologistProfile?.specializations || []).join(", ")
  );
  const [experienceYears, setExperienceYears] = useState(
    cosmetologistProfile?.experienceYears?.toString() || ""
  );
  const [bio, setBio] = useState(cosmetologistProfile?.bio || "");
  const [isPublic, setIsPublic] = useState(cosmetologistProfile?.isPublic ?? true);

  const [skinType, setSkinType] = useState(clientPersonalInfo?.skinType || "");
  const [allergies, setAllergies] = useState(clientPersonalInfo?.allergies || "");
  const [medicalConditions, setMedicalConditions] = useState(
    clientPersonalInfo?.medicalConditions || ""
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const body: Record<string, unknown> = {
      name,
      phone,
      avatar,
    };

    if (user.role === "cosmetologist") {
      body.cosmetologistProfile = {
        specializations: specializations.split(",").map((s) => s.trim()).filter(Boolean),
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
        bio: bio || null,
        isPublic,
      };
    }

    if (user.role === "client") {
      body.clientPersonalInfo = {
        skinType: skinType || null,
        allergies: allergies || null,
        medicalConditions: medicalConditions || null,
      };
    }

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccess("Profile updated successfully");
        await onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function getInitials() {
    if (!user.name) return user.email.charAt(0).toUpperCase();
    return user.name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name || user.email} />
            ) : null}
            <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name || "Profile"}</CardTitle>
            <CardDescription className="capitalize">{user.role}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="size-4" />
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Avatar URL</label>
            <div className="relative">
              <Camera className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  placeholder="Your name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <div className="relative">
                <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={user.email}
                disabled
                className="pl-9 opacity-60"
              />
            </div>
          </div>

          {user.role === "cosmetologist" && (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-heading text-base font-medium">Cosmetologist Profile</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Specializations (comma-separated)</label>
                <Input
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  placeholder="Facials, Peels, Injections"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Years of Experience</label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Tell clients about yourself..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                <label htmlFor="isPublic" className="text-sm">
                  Public profile (visible to clients)
                </label>
              </div>
            </div>
          )}

          {user.role === "client" && (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-heading text-base font-medium">Personal Health Info</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Skin Type</label>
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select skin type</option>
                  <option value="normal">Normal</option>
                  <option value="dry">Dry</option>
                  <option value="oily">Oily</option>
                  <option value="combination">Combination</option>
                  <option value="sensitive">Sensitive</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Allergies</label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="List any known allergies..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medical Conditions</label>
                <textarea
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Any relevant medical conditions..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ResetSuccessBanner() {
  const searchParams = useSearchParams();
  const resetParam = searchParams.get("reset");
  if (resetParam !== "success") return null;
  return (
    <div className="mx-auto max-w-2xl px-4 pb-0 pt-4">
      <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
        <CheckCircle className="size-4" />
        Password reset successfully. You can now update your profile.
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ResetSuccessBanner />
      <ProfileForm key={user.id} user={user as FullUser} onSuccess={refreshUser} />
    </div>
  );
}
