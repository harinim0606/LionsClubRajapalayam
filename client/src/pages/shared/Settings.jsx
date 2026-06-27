import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../context/SettingsContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { 
  Monitor, Moon, Sun, Type, Eye, EyeOff, Accessibility, 
  AlignLeft, LayoutGrid, Palette, Check, Save, RotateCcw,
  Lock, Shield, KeyRound, CheckCircle2
} from "lucide-react";

const Settings = () => {
  const { t } = useTranslation();
  const { settings, updateSettings, isLoading } = useSettings();
  
  // Local state for edits before saving
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance"); // appearance, language, accessibility, security

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  // Keep local state synced if global changes externally (unlikely but good practice)
  React.useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      toast.success(t("settings.successMessage"));
    } catch (error) {
      toast.error(t("settings.errorMessage"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const defaultSettings = {
      theme: "system",
      language: "en",
      accessibility: {
        textSize: "medium",
        fontFamily: "default",
        highContrast: false,
        reduceMotion: false,
        lineSpacing: 1,
        letterSpacing: 0,
        sidebarDensity: "comfortable",
        roundedCorners: true,
      }
    };
    setLocalSettings(defaultSettings);
    try {
      await updateSettings(defaultSettings);
      toast.success("Settings reset to defaults");
    } catch (error) {
      toast.error("Failed to reset settings");
    }
  };

  const updateAcc = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      accessibility: { ...prev.accessibility, [key]: value }
    }));
  };

  // --- Password handlers ---
  const getPasswordStrength = (pw) => {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: "Too short", color: "bg-red-400" },
      { label: "Weak", color: "bg-red-400" },
      { label: "Fair", color: "bg-amber-400" },
      { label: "Good", color: "bg-blue-400" },
      { label: "Strong", color: "bg-green-500" },
    ];
    return { score, ...levels[score] };
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwForm.currentPassword) errors.currentPassword = "Current password is required.";
    if (pwForm.newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters.";
    if (pwForm.newPassword !== pwForm.confirmPassword) errors.confirmPassword = "Passwords do not match.";
    if (Object.keys(errors).length > 0) { setPwErrors(errors); return; }
    setPwErrors({});
    setPwLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password.";
      toast.error(msg);
      if (msg.toLowerCase().includes("current")) {
        setPwErrors({ currentPassword: msg });
      }
    } finally {
      setPwLoading(false);
    }
  };

  // --- Components for sections ---

  const AppearanceSection = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 dark:text-white"><Palette size={20}/> {t("settings.appearance.theme")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: "light", icon: Sun, label: t("settings.appearance.light") },
            { id: "dark", icon: Moon, label: t("settings.appearance.dark") },
            { id: "system", icon: Monitor, label: t("settings.appearance.system") },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setLocalSettings(p => ({ ...p, theme: opt.id }))}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                localSettings.theme === opt.id 
                ? "border-[#0A2A5E] bg-[#0A2A5E]/5 text-[#0A2A5E] dark:border-[#F4B400] dark:text-[#F4B400] dark:bg-[#F4B400]/10" 
                : "border-gray-200 hover:border-[#0A2A5E]/30 text-gray-600 dark:border-gray-700 dark:text-gray-400"
              }`}
            >
              <opt.icon size={24} />
              <span className="font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const LanguageSection = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4 dark:text-white">{t("settings.language.selectLanguage")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {["en", "ta", "hi", "ml", "te"].map(lang => (
            <button
              key={lang}
              onClick={() => setLocalSettings(p => ({ ...p, language: lang }))}
              className={`px-4 py-3 rounded-xl border-2 text-left font-semibold transition-all ${
                localSettings.language === lang 
                ? "border-[#0A2A5E] bg-[#0A2A5E] text-white dark:border-[#F4B400] dark:bg-[#F4B400] dark:text-black" 
                : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{t(`settings.language.${lang}`)}</span>
                {localSettings.language === lang && <Check size={18} />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const AccessibilitySection = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
      
      {/* Text Size */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Type size={16}/> {t("settings.accessibility.textSize")}</h3>
        <div className="flex flex-wrap gap-3">
          {["small", "medium", "large", "xlarge"].map(size => (
            <button
              key={size}
              onClick={() => updateAcc("textSize", size)}
              className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all ${
                localSettings.accessibility.textSize === size 
                ? "border-[#0A2A5E] bg-[#0A2A5E]/10 text-[#0A2A5E] dark:border-[#F4B400] dark:text-[#F4B400]" 
                : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
              }`}
            >
              {t(`settings.accessibility.${size}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><AlignLeft size={16}/> {t("settings.accessibility.fontFamily")}</h3>
        <div className="flex flex-wrap gap-3">
          {["default", "open-sans", "inter", "roboto"].map(font => (
            <button
              key={font}
              onClick={() => updateAcc("fontFamily", font)}
              className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all ${
                localSettings.accessibility.fontFamily === font 
                ? "border-[#0A2A5E] bg-[#0A2A5E]/10 text-[#0A2A5E] dark:border-[#F4B400] dark:text-[#F4B400]" 
                : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
              }`}
            >
              {font === "default" ? t("settings.accessibility.default") : font.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Toggles */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Eye size={16}/> {t("settings.accessibility.title")} Options</h3>
          
          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-pointer">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t("settings.accessibility.highContrast")}</span>
            <input 
              type="checkbox" 
              checked={localSettings.accessibility.highContrast} 
              onChange={(e) => updateAcc("highContrast", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#0A2A5E] focus:ring-[#0A2A5E]"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-pointer">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t("settings.accessibility.reduceMotion")}</span>
            <input 
              type="checkbox" 
              checked={localSettings.accessibility.reduceMotion} 
              onChange={(e) => updateAcc("reduceMotion", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#0A2A5E] focus:ring-[#0A2A5E]"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-pointer">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t("settings.accessibility.roundedCorners")}</span>
            <input 
              type="checkbox" 
              checked={localSettings.accessibility.roundedCorners} 
              onChange={(e) => updateAcc("roundedCorners", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#0A2A5E] focus:ring-[#0A2A5E]"
            />
          </label>
        </div>

        {/* Sliders & Layout */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><LayoutGrid size={16}/> Layout</h3>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-semibold text-gray-700 dark:text-gray-300">{t("settings.accessibility.lineSpacing")}</label>
              <span className="text-gray-500">{localSettings.accessibility.lineSpacing}x</span>
            </div>
            <input 
              type="range" min="1" max="2" step="0.1" 
              value={localSettings.accessibility.lineSpacing}
              onChange={(e) => updateAcc("lineSpacing", parseFloat(e.target.value))}
              className="w-full accent-[#0A2A5E] dark:accent-[#F4B400]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="font-semibold text-gray-700 dark:text-gray-300">{t("settings.accessibility.letterSpacing")}</label>
              <span className="text-gray-500">{localSettings.accessibility.letterSpacing}px</span>
            </div>
            <input 
              type="range" min="-1" max="5" step="0.5" 
              value={localSettings.accessibility.letterSpacing}
              onChange={(e) => updateAcc("letterSpacing", parseFloat(e.target.value))}
              className="w-full accent-[#0A2A5E] dark:accent-[#F4B400]"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">{t("settings.accessibility.sidebarDensity")}</label>
            <div className="flex gap-3">
              {["compact", "comfortable"].map(dens => (
                <button
                  key={dens}
                  onClick={() => updateAcc("sidebarDensity", dens)}
                  className={`flex-1 py-2 rounded-xl border-2 font-semibold transition-all ${
                    localSettings.accessibility.sidebarDensity === dens 
                    ? "border-[#0A2A5E] bg-[#0A2A5E]/10 text-[#0A2A5E] dark:border-[#F4B400] dark:text-[#F4B400]" 
                    : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                  }`}
                >
                  {t(`settings.accessibility.${dens}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );

  const SecuritySection = () => {
    const strength = getPasswordStrength(pwForm.newPassword);
    const PwField = ({ id, label, value, showKey, placeholder, error }) => (
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={16} className="text-gray-400" />
          </div>
          <input
            type={pwShow[showKey] ? "text" : "password"}
            value={value}
            onChange={(e) => setPwForm(p => ({ ...p, [id]: e.target.value }))}
            placeholder={placeholder}
            className={`w-full pl-9 pr-10 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-[#0A2A5E]/30 dark:focus:ring-[#F4B400]/30 bg-gray-50 dark:bg-gray-800 dark:text-white ${
              error 
                ? "border-red-400 focus:border-red-400" 
                : "border-gray-200 dark:border-gray-700 focus:border-[#0A2A5E] dark:focus:border-[#F4B400]"
            }`}
          />
          <button
            type="button"
            onClick={() => setPwShow(p => ({ ...p, [showKey]: !p[showKey] }))}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {pwShow[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {error}</p>}
      </div>
    );
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-[#0A2A5E]/10 dark:bg-[#F4B400]/10 flex items-center justify-center">
            <KeyRound size={20} className="text-[#0A2A5E] dark:text-[#F4B400]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Change Password</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Update your account password. You'll need your current password to make changes.</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
          <PwField id="currentPassword" label="Current Password" value={pwForm.currentPassword} showKey="current" placeholder="Enter your current password" error={pwErrors.currentPassword} />

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          <PwField id="newPassword" label="New Password" value={pwForm.newPassword} showKey="newPw" placeholder="Minimum 8 characters" error={pwErrors.newPassword} />

          {/* Strength Indicator */}
          {pwForm.newPassword && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : "bg-gray-200 dark:bg-gray-700"}`} />
                ))}
              </div>
              <p className={`text-xs font-semibold ${
                strength.score <= 1 ? "text-red-500" : strength.score === 2 ? "text-amber-500" : strength.score === 3 ? "text-blue-500" : "text-green-600"
              }`}>{strength.label}</p>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 mt-1">
                {[{test: pwForm.newPassword.length >= 8, label: "At least 8 characters"}, {test: /[A-Z]/.test(pwForm.newPassword), label: "One uppercase letter"}, {test: /[0-9]/.test(pwForm.newPassword), label: "One number"}, {test: /[^A-Za-z0-9]/.test(pwForm.newPassword), label: "One special character"}].map(({test, label}) => (
                  <li key={label} className={`flex items-center gap-1.5 ${test ? "text-green-600" : ""}`}>
                    <CheckCircle2 size={11} className={test ? "text-green-500" : "text-gray-300"} /> {label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <PwField id="confirmPassword" label="Confirm New Password" value={pwForm.confirmPassword} showKey="confirm" placeholder="Re-enter new password" error={pwErrors.confirmPassword} />

          <button
            type="submit"
            disabled={pwLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#0A2A5E] hover:bg-[#071D43] dark:bg-[#F4B400] dark:hover:bg-[#D69E00] text-white dark:text-black rounded-xl font-bold transition-all shadow-md disabled:opacity-70"
          >
            {pwLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-black/20 dark:border-t-black rounded-full animate-spin" /> : <Shield size={18} />}
            {pwLoading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {/* Security Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 max-w-md">
          <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2">Security Tips</p>
          <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Never share your password with anyone.</li>
            <li>• Use a mix of letters, numbers and symbols.</li>
            <li>• Your default password is your Date of Birth (DDMMYYYY).</li>
          </ul>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">{t("settings.title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your appearance, language, and accessibility preferences.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2 flex-1 md:flex-none"
          >
            <RotateCcw size={18} />
            <span className="hidden sm:inline">{t("settings.resetSettings")}</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-[#0A2A5E] hover:bg-[#071D43] text-white dark:bg-[#F4B400] dark:hover:bg-[#D69E00] dark:text-black rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 flex-1 md:flex-none disabled:opacity-70"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={18} />}
            {t("settings.saveChanges")}
          </button>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
          {[
            { id: "appearance", icon: Palette, label: t("settings.appearance.title") },
            { id: "language", icon: Type, label: t("settings.language.title") },
            { id: "accessibility", icon: Accessibility, label: t("settings.accessibility.title") },
            { id: "security", icon: Shield, label: "Security" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                ? "border-[#0A2A5E] text-[#0A2A5E] dark:border-[#F4B400] dark:text-[#F4B400]" 
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "appearance" && <AppearanceSection key="appearance" />}
            {activeTab === "language" && <LanguageSection key="language" />}
            {activeTab === "accessibility" && <AccessibilitySection key="accessibility" />}
            {activeTab === "security" && <SecuritySection key="security" />}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default Settings;
