import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../context/SettingsContext";
import toast from "react-hot-toast";
import { 
  Monitor, Moon, Sun, Type, Eye, Accessibility, 
  AlignLeft, LayoutGrid, Palette, Check, Save, RotateCcw
} from "lucide-react";

const Settings = () => {
  const { t } = useTranslation();
  const { settings, updateSettings, isLoading } = useSettings();
  
  // Local state for edits before saving
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance"); // appearance, language, accessibility

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
            { id: "accessibility", icon: Accessibility, label: t("settings.accessibility.title") }
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
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default Settings;
