import { Camera, Mail, Phone, ShieldCheck, UploadCloud } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import PlanUpgradeModal from '../../components/common/PlanUpgradeModal'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { authApi } from '../../services/authApi'
import { userApi } from '../../services/userApi'
import { logoutThunk, setCredentials } from '../../store/authSlice'
import { pushToast } from '../../store/toastSlice'
import type { AuthUser } from '../../types/auth'
import { getApiErrorCode, getApiErrorMessage } from '../../utils/errors'

const tabs = ['profile', 'account', 'security', 'appearance'] as const
type TabKey = (typeof tabs)[number]

const commonTimezones = [
  'Asia/Kolkata',
  'UTC',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
] as const

const usernamePattern = /^(?=.{3,30}$)[a-zA-Z0-9]+(?:[._-]?[a-zA-Z0-9]+)*$/
const phonePattern = /^\+?[1-9]\d{7,14}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const buildInitialForm = (user: AuthUser | null) => ({
  fullName: user?.fullName || '',
  username: user?.username || '',
  bio: user?.bio || '',
  timezone:
    user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  avatarUrl: user?.avatarUrl || '',
  email: user?.email || '',
  phone: user?.phone || '',
  backupEmail: user?.backupEmail || '',
  currentPassword: '',
  newPassword: '',
  accentColor: user?.appearance?.accentColor || 'violet',
  compactMode: Boolean(user?.appearance?.compactMode),
  previewTheme: user?.appearance?.theme || 'system',
})

type SettingsForm = ReturnType<typeof buildInitialForm>

const isStrongPassword = (value: string) =>
  value.length >= 8 &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z0-9]/.test(value)

const SettingsPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const baseForm = useMemo(() => buildInitialForm(user), [user])
  const [activeTab, setActiveTab] = useState<TabKey>('profile')
  const [loadingSection, setLoadingSection] = useState<TabKey | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [draftForm, setDraftForm] = useState<SettingsForm | null>(null)
  const form = draftForm ?? baseForm

  const updateForm = (updater: (previous: SettingsForm) => SettingsForm) => {
    setDraftForm((previous) => updater(previous ?? baseForm))
  }

  const profileSummary = useMemo(
    () => [
      user?.fullName || 'Your profile',
      user?.email || '',
      user?.timezone || form.timezone,
    ].filter(Boolean).join(' - '),
    [form.timezone, user?.email, user?.fullName, user?.timezone],
  )

  const runSave = async (section: TabKey, action: () => Promise<void>) => {
    setLoadingSection(section)
    try {
      await action()
    } catch (error) {
      dispatch(pushToast({
        title: 'Settings update failed',
        description: getApiErrorMessage(error, 'Please review your changes and try again.'),
        tone: 'error',
      }))
    } finally {
      setLoadingSection(null)
    }
  }

  const saveProfile = async () => {
    const fullName = form.fullName.trim()
    const username = form.username.trim().toLowerCase()
    const bio = form.bio.trim()
    const timezone = form.timezone.trim()

    if (fullName.length < 2) {
      dispatch(pushToast({
        title: 'Profile details need attention',
        description: 'Full name must be at least 2 characters long.',
        tone: 'error',
      }))
      return
    }

    if (!usernamePattern.test(username)) {
      dispatch(pushToast({
        title: 'Choose a valid username',
        description: 'Use 3-30 characters with letters, numbers, dots, underscores, or hyphens.',
        tone: 'error',
      }))
      return
    }

    if (bio.length > 200 || !timezone) {
      dispatch(pushToast({
        title: 'Profile details need attention',
        description: 'Bio must stay under 200 characters and timezone cannot be empty.',
        tone: 'error',
      }))
      return
    }

    await runSave('profile', async () => {
      const response = await userApi.updateProfile({
        fullName,
        username,
        bio,
        timezone,
        avatarUrl: form.avatarUrl.trim(),
      })
      dispatch(setCredentials(response.user))
      setDraftForm(null)
      dispatch(pushToast({
        title: 'Profile updated',
        description: 'Your public profile details are now up to date.',
        tone: 'success',
      }))
    })
  }

  const saveAccount = async () => {
    const email = form.email.trim().toLowerCase()
    const backupEmail = form.backupEmail.trim().toLowerCase()
    const phone = form.phone.trim()

    if (!emailPattern.test(email)) {
      dispatch(pushToast({
        title: 'Account details need attention',
        description: 'Enter a valid primary email address.',
        tone: 'error',
      }))
      return
    }

    if (backupEmail && !emailPattern.test(backupEmail)) {
      dispatch(pushToast({
        title: 'Account details need attention',
        description: 'Backup email must be a valid email address.',
        tone: 'error',
      }))
      return
    }

    if (backupEmail && backupEmail === email) {
      dispatch(pushToast({
        title: 'Account details need attention',
        description: 'Backup email should be different from your primary login email.',
        tone: 'error',
      }))
      return
    }

    if (phone && !phonePattern.test(phone)) {
      dispatch(pushToast({
        title: 'Account details need attention',
        description: 'Phone number must include a valid international format.',
        tone: 'error',
      }))
      return
    }

    await runSave('account', async () => {
      const response = await userApi.updateAccount({
        email,
        phone,
        backupEmail,
      })
      dispatch(setCredentials(response.user))
      setDraftForm(null)
      dispatch(pushToast({
        title: 'Account updated',
        description: 'Contact and recovery details have been saved.',
        tone: 'success',
      }))
    })
  }

  const saveSecurity = async () => {
    if (!form.currentPassword || !form.newPassword) {
      dispatch(pushToast({
        title: 'Security details need attention',
        description: 'Enter both your current password and a new password.',
        tone: 'error',
      }))
      return
    }

    if (!isStrongPassword(form.newPassword)) {
      dispatch(pushToast({
        title: 'Choose a stronger password',
        description: 'Use upper, lower, number, and special characters in at least 8 characters.',
        tone: 'error',
      }))
      return
    }

    await runSave('security', async () => {
      const response = await userApi.updatePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      updateForm((previous) => ({ ...previous, currentPassword: '', newPassword: '' }))

      if (response.forceLogout) {
        await dispatch(logoutThunk())
        navigate('/login?reset=1', { replace: true })
        return
      }

      dispatch(pushToast({
        title: 'Password updated',
        description: response.message,
        tone: 'success',
      }))
    })
  }

  const logoutAllDevices = async () => {
    await runSave('security', async () => {
      const response = await userApi.logoutAll()
      await dispatch(logoutThunk())
      navigate('/login?logoutAll=1', { replace: true })
      dispatch(pushToast({
        title: 'All sessions closed',
        description: response.message,
        tone: 'success',
      }))
    })
  }

  const saveAppearance = async () => {
    await runSave('appearance', async () => {
      const response = await userApi.updateAppearance({
        theme: form.previewTheme,
        accentColor: form.accentColor.trim() || 'violet',
        compactMode: form.compactMode,
      })
      if (user) {
        dispatch(
          setCredentials({
            ...user,
            appearance: response.appearance,
          }),
        )
      }
      setDraftForm(null)
      dispatch(pushToast({
        title: 'Appearance saved',
        description: 'Theme preferences will carry across your workspace sessions.',
        tone: 'success',
      }))
    })
  }

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      dispatch(pushToast({
        title: 'Unsupported avatar format',
        description: 'Choose a JPG, PNG, WEBP, or GIF image for your profile picture.',
        tone: 'error',
      }))
      return
    }

    setUploadingAvatar(true)
    try {
      const response = await userApi.uploadAvatar(file)
      
      updateForm((previous) => ({ ...previous, avatarUrl: response.user.avatarUrl }))
      dispatch(setCredentials(response.user))
      
      dispatch(pushToast({
        title: 'Avatar uploaded',
        description: 'Your profile picture has been updated globally.',
        tone: 'success',
      }))
    } catch (error) {
      if (getApiErrorCode(error) === 'storage_limit_exceeded') {
        setUpgradeOpen(true)
      } else {
        dispatch(pushToast({
          title: 'Upload failed',
          description: getApiErrorMessage(error, 'Your avatar could not be uploaded right now.'),
          tone: 'error',
        }))
      }
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <section className="space-y-4 pb-5">
      <div className="rounded-[30px] border border-white/10 glass-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user?.fullName || form.fullName} size="xl" src={form.avatarUrl || user?.avatarUrl} />
            <div>
              <h1 className="text-2xl font-semibold text-white font-semibold drop-shadow-md">Settings</h1>
              <p className="mt-1 text-sm text-zinc-400">{profileSummary}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                className={`rounded-full px-4 py-2 text-sm capitalize ${
                  activeTab === item
                    ? 'bg-brand-500 text-white'
                    : 'border border-white/10 text-zinc-300 dark:border-zinc-700 dark:text-zinc-300'
                }`}
                key={item}
                onClick={() => setActiveTab(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'profile' && (
        <article className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
          <div className="rounded-[30px] border border-white/10 glass-panel p-5">
            <p className="text-sm font-semibold text-white font-semibold drop-shadow-md">Profile picture</p>
            <p className="mt-1 text-sm text-zinc-400">
              Your avatar is used in the navbar, team directory, chat, and activity feeds.
            </p>
            <div className="mt-6 flex flex-col items-center gap-4 rounded-[28px] border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
              <Avatar name={form.fullName || user?.fullName} size="xl" src={form.avatarUrl || user?.avatarUrl} />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:glass-card dark:text-white dark:hover:glass-card/10">
                {uploadingAvatar ? <UploadCloud className="animate-pulse" size={16} /> : <Camera size={16} />}
                {uploadingAvatar ? 'Uploading...' : 'Upload avatar'}
                <input
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => {
                    handleAvatarUpload(event.target.files?.[0] || null)
                    event.target.value = ''
                  }}
                  type="file"
                />
              </label>
              <p className="text-xs text-zinc-400">
                JPG, PNG, or WEBP up to 25MB. You can also keep using an external image URL below.
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 glass-panel p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-zinc-200">Full name</span>
                <input className="w-full rounded-2xl border border-white/10 px-3 py-2.5 text-sm dark:border-zinc-700 bg-black/20" value={form.fullName} onChange={(event) => updateForm((previous) => ({ ...previous, fullName: event.target.value }))} />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-zinc-200">Username</span>
                <input className="w-full rounded-2xl border border-white/10 px-3 py-2.5 text-sm dark:border-zinc-700 bg-black/20" value={form.username} onChange={(event) => updateForm((previous) => ({ ...previous, username: event.target.value }))} />
              </label>
            </div>
            <label className="mt-4 block space-y-2 text-sm">
              <span className="font-medium text-zinc-200">Avatar URL</span>
              <input className="w-full rounded-2xl border border-white/10 px-3 py-2.5 text-sm dark:border-zinc-700 bg-black/20" value={form.avatarUrl} onChange={(event) => updateForm((previous) => ({ ...previous, avatarUrl: event.target.value }))} />
            </label>
            <label className="mt-4 block space-y-2 text-sm">
              <span className="font-medium text-zinc-200">Bio</span>
              <textarea className="w-full rounded-2xl border border-white/10 px-3 py-2.5 text-sm dark:border-zinc-700 bg-black/20" maxLength={200} rows={4} value={form.bio} onChange={(event) => updateForm((previous) => ({ ...previous, bio: event.target.value }))} />
              <span className="text-xs text-zinc-400">{form.bio.trim().length}/200 characters</span>
            </label>
            <label className="mt-4 block space-y-2 text-sm">
              <span className="font-medium text-zinc-200">Timezone</span>
              <select className="w-full rounded-2xl border border-white/10 px-3 py-2.5 text-sm dark:border-zinc-700 bg-black/20" value={form.timezone} onChange={(event) => updateForm((previous) => ({ ...previous, timezone: event.target.value }))}>
                {[form.timezone, ...commonTimezones].filter((value, index, items) => value && items.indexOf(value) === index).map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </label>
            <button className="mt-6 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-60" disabled={loadingSection === 'profile' || uploadingAvatar} onClick={saveProfile} type="button">
              {loadingSection === 'profile' ? 'Saving profile...' : 'Save profile'}
            </button>
          </div>
        </article>
      )}

      {activeTab === 'account' && (
        <article className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[30px] border border-white/10 glass-panel p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-zinc-200">
                  <Mail size={15} />Primary email
                  {user?.provider === 'local' && (
                    user?.emailVerified
                      ? <span className="rounded-full bg-green-900/40 px-2 py-0.5 text-xs text-green-400">Verified</span>
                      : (
                        <button
                          className="rounded-full bg-amber-900/40 px-2 py-0.5 text-xs text-amber-400 hover:bg-amber-900/60"
                          disabled={verifyingEmail}
                          onClick={async (event) => {
                            event.preventDefault()
                            setVerifyingEmail(true)
                            try {
                              await authApi.sendVerificationEmail()
                              dispatch(pushToast({ title: 'Verification email sent', description: 'Check your inbox.', tone: 'success' }))
                            } catch {
                              dispatch(pushToast({ title: 'Failed to send', description: 'Try again later.', tone: 'error' }))
                            } finally {
                              setVerifyingEmail(false)
                            }
                          }}
                          type="button"
                        >
                          {verifyingEmail ? 'Sending...' : 'Unverified — send verification'}
                        </button>
                      )
                  )}
                </span>
                <input className="w-full rounded-2xl border border-white/10 px-3 py-2.5 text-sm dark:border-zinc-700 bg-black/20" value={form.email} onChange={(event) => updateForm((previous) => ({ ...previous, email: event.target.value }))} />
              </label>
              <label className="space-y-2 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-zinc-200"><Phone size={15} />Phone</span>
                <input className="w-full rounded-2xl border border-white/10 px-3 py-2.5 text-sm dark:border-zinc-700 bg-black/20" value={form.phone} onChange={(event) => updateForm((previous) => ({ ...previous, phone: event.target.value }))} />
              </label>
            </div>
            <label className="mt-4 block space-y-2 text-sm">
              <span className="font-medium text-zinc-200">Backup email</span>
              <input className="w-full rounded-2xl border border-white/10 px-3 py-2.5 text-sm dark:border-zinc-700 bg-black/20" value={form.backupEmail} onChange={(event) => updateForm((previous) => ({ ...previous, backupEmail: event.target.value }))} />
            </label>
            <button className="mt-6 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-60" disabled={loadingSection === 'account'} onClick={saveAccount} type="button">
              {loadingSection === 'account' ? 'Saving account...' : 'Save account'}
            </button>
          </div>

          <div className="rounded-[30px] border border-white/10 glass-panel p-5">
            <p className="text-sm font-semibold text-white font-semibold drop-shadow-md">Recovery guidance</p>
            <div className="mt-4 space-y-3">
              {[
                'Keep a backup email on file so password recovery stays reliable.',
                'Use an international phone format if your team works across regions.',
                'Primary email changes may affect future login and notification routing.',
              ].map((item) => (
                <div className="rounded-2xl glass-card/5 p-3 text-sm text-zinc-300 bg-black/20 dark:text-zinc-300" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </article>
      )}

      {activeTab === 'security' && (
        <article className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[30px] border border-white/10 glass-panel p-5">
            <p className="text-sm font-semibold text-white font-semibold drop-shadow-md">Change password</p>
            <p className="mt-1 text-sm text-zinc-400">
              Updating your password signs out every active session so your account stays safe.
            </p>
            <div className="mt-5 grid gap-4">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-zinc-200">Current password</span>
                <input className="w-full rounded-2xl border border-white/10 px-3 py-2.5 text-sm dark:border-zinc-700 bg-black/20" placeholder="Current password" type="password" value={form.currentPassword} onChange={(event) => updateForm((previous) => ({ ...previous, currentPassword: event.target.value }))} />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-zinc-200">New password</span>
                <input className="w-full rounded-2xl border border-white/10 px-3 py-2.5 text-sm dark:border-zinc-700 bg-black/20" placeholder="New password" type="password" value={form.newPassword} onChange={(event) => updateForm((previous) => ({ ...previous, newPassword: event.target.value }))} />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-60" disabled={loadingSection === 'security'} onClick={saveSecurity} type="button">
                {loadingSection === 'security' ? 'Updating security...' : 'Change password'}
              </button>
              <button className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm dark:border-zinc-700" disabled={loadingSection === 'security'} onClick={logoutAllDevices} type="button">
                Logout all devices
              </button>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 glass-panel p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-white font-semibold drop-shadow-md"><ShieldCheck size={16} />Security reminders</p>
            <div className="mt-4 space-y-3">
              {[
                'Use a unique password for DsSync Hub.',
                'Reset links expire automatically to reduce account risk.',
                'Logout all devices is available if you suspect credential sharing.',
              ].map((item) => (
                <div className="rounded-2xl glass-card/5 p-3 text-sm text-zinc-300 bg-black/20 dark:text-zinc-300" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </article>
      )}

      {activeTab === 'appearance' && (
        <article className="rounded-[30px] border border-white/10 glass-panel p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-white font-semibold drop-shadow-md">Theme</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(['light', 'dark', 'system'] as const).map((item) => (
                  <button
                    className={`rounded-full px-4 py-2 text-sm capitalize ${
                      form.previewTheme === item
                        ? 'bg-brand-500 text-white'
                        : 'border border-white/10 text-zinc-300 dark:border-zinc-700 dark:text-zinc-300'
                    }`}
                    key={item}
                    onClick={() => updateForm((previous) => ({ ...previous, previewTheme: item }))}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white font-semibold drop-shadow-md">Workspace density</p>
              <label className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-300">
                <input checked={form.compactMode} onChange={(event) => updateForm((previous) => ({ ...previous, compactMode: event.target.checked }))} type="checkbox" />
                Compact mode
              </label>
            </div>
          </div>
          <label className="mt-6 block max-w-md space-y-2 text-sm">
            <span className="font-medium text-zinc-200">Accent color token</span>
            <input className="w-full rounded-2xl border border-white/10 px-3 py-2.5 text-sm dark:border-zinc-700 bg-black/20" value={form.accentColor} onChange={(event) => updateForm((previous) => ({ ...previous, accentColor: event.target.value }))} />
          </label>
          <p className="mt-3 text-xs text-zinc-400">
            Appearance changes apply after save and are restored automatically the next time your session is loaded.
          </p>
          <button className="mt-6 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-60" disabled={loadingSection === 'appearance'} onClick={saveAppearance} type="button">
            {loadingSection === 'appearance' ? 'Saving appearance...' : 'Save appearance'}
          </button>
        </article>
      )}

      <PlanUpgradeModal
        message="Your workspace storage is full on the current plan. Upgrade to keep uploading profile images and shared assets."
        onClose={() => setUpgradeOpen(false)}
        open={upgradeOpen}
        title="Storage limit reached"
      />
    </section>
  )
}

export default SettingsPage
