"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import AvatarCropper from "@/components/account/avatar-cropper";
import {
  compressImageBlob,
  getCroppedImageBlob,
  readFileAsDataURL,
} from "@/lib/image-processing";

const initialForm = {
  name: "",
  username: "",
  email: "",
  phone: "",
  profileImage: "",
};

export default function AccountPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [cropSource, setCropSource] = useState("");
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const fileInputRef = useRef(null);

  const avatarFallback = useMemo(() => {
    const source = form.name?.trim() || form.username?.trim() || form.email?.trim() || "U";
    return source.charAt(0).toUpperCase();
  }, [form.email, form.name, form.username]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        const user = data.data || {};
        setForm({
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          phone: user.phone || user.contact || "",
          profileImage: user.profileImage || user.avatar || "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateField = (key, value) => {
    setMessage("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onUpdate = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        name: form.name,
        username: form.username,
        phone: form.phone,
        profileImage: form.profileImage,
      };
      const { data } = await api.put("/api/auth/update", payload);
      const user = data.data || {};
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        username: user.username || "",
        phone: user.phone || user.contact || "",
        profileImage: user.profileImage || user.avatar || "",
      }));
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = () => {
    setShowSignOutModal(false);
    localStorage.removeItem("devflow_token");
    localStorage.removeItem("token");
    router.replace("/login");
  };

  const onBack = () => {
    router.back();
  };

  const handleSelectFile = async (file) => {
    if (!file || uploading) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      return;
    }

    const dataUrl = await readFileAsDataURL(file);
    setCropSource(dataUrl);
  };

  const onUploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    await handleSelectFile(file);
    event.target.value = "";
  };

  const onConfirmCrop = async (cropAreaPixels) => {
    if (!cropAreaPixels || !cropSource) return;
    setUploading(true);
    setUploadProgress(0);
    setMessage("");
    try {
      const croppedBlob = await getCroppedImageBlob(cropSource, cropAreaPixels);
      const compressedBlob = await compressImageBlob(croppedBlob, {
        maxWidth: 512,
        quality: 0.82,
      });
      const uploadFile = new File([compressedBlob], "avatar.jpg", {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", uploadFile);
      const { data } = await api.post("/api/upload/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1;
          const value = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(value);
        },
      });
      const url = data?.url || data?.data?.url || "";
      if (url) {
        setForm((prev) => ({ ...prev, profileImage: url }));
        setMessage("Photo uploaded. Click Update to save profile.");
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCropSource("");
    }
  };

  const onDrop = async (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    await handleSelectFile(file);
  };

  return (
    <ProtectedRoute>
      <DashboardShell>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Account</h1>
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading profile...</p>
            ) : (
              <form className="space-y-5" onSubmit={onUpdate}>
                <div className="flex items-center gap-4">
                  {form.profileImage ? (
                    <img
                      src={form.profileImage}
                      alt="Profile avatar"
                      className="h-14 w-14 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                      {avatarFallback}
                    </div>
                  )}
                  <div className="w-full space-y-2">
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragActive(true);
                      }}
                      onDragLeave={() => setIsDragActive(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer rounded-lg border border-dashed p-4 text-center text-sm transition ${
                        isDragActive
                          ? "border-slate-500 bg-slate-100 dark:bg-slate-800"
                          : "border-slate-300 hover:border-slate-500 dark:border-slate-700"
                      }`}
                    >
                      Drag and drop profile image here, or click to upload
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? `Uploading ${uploadProgress}%` : "Change Image"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading || !form.profileImage}
                        onClick={() => updateField("profileImage", "")}
                      >
                        Remove
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onUploadAvatar}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Square crop + compression are applied before upload.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Input
                      placeholder="Name"
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Username"
                      value={form.username}
                      onChange={(event) => updateField("username", event.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      3–40 characters, letters and numbers only (no special characters).
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Email"
                      value={form.email}
                      disabled
                      className="cursor-not-allowed opacity-70"
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Contact"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                    />
                  </div>
                </div>

                {message && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Updating..." : "Update"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSignOutModal(true)}
                  >
                    Sign Out
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
        {cropSource && (
          <AvatarCropper
            imageSrc={cropSource}
            onCancel={() => setCropSource("")}
            onConfirm={onConfirmCrop}
          />
        )}
        {showSignOutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl border bg-white p-5 dark:bg-slate-900">
              <h3 className="text-lg font-semibold">Sign out</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to sign out?
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSignOutModal(false)}>
                  Cancel
                </Button>
                <Button onClick={onSignOut}>Sign Out</Button>
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
